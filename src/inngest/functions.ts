import { z } from 'zod';
import { Sandbox } from '@e2b/code-interpreter';
import {
  openai,
  createAgent,
  createTool,
  createNetwork,
  type Tool,
  type Message,
  createState,
} from '@inngest/agent-kit';

import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from '@/prompt';

import { inngest } from './client';
import { getSandbox, lastAssistantTextMessageContent } from './utils';
import prisma from '@/lib/db';

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: 'code-agent' },
  { event: 'code-agent/run' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('nova-next-js-test-2');
      return sandbox.sandboxId;
    });

    // agent memory

    const previousMessages = await step.run(
      'get-previous-messages',
      async () => {
        const formattedMessages: Message[] = [];

        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            //TODO: change to asc if AI not understand what is the latest message
            createdAt: 'desc',
          },
        });

        for (const message of messages) {
          formattedMessages.push({
            type: 'text',
            role: message.role === 'ASSISTANCE' ? 'assistant' : 'user',
            content: message.content,
          });
        }
        return formattedMessages;
      },
    );

    const state = createState<AgentState>(
      {
        summary: '',
        files: {},
      },
      {
        messages: previousMessages,
      },
    );

    const codeAgent = createAgent<AgentState>({
      name: 'code-agent',
      description: 'An Expert Coding Agent',
      system: PROMPT,
      model: openai({
        model: 'gpt-4.1',
        defaultParameters: {
          // Randomness is good for code generation for result diversity
          temperature: 0.1,
        },
      }),
      tools: [
        // Tool for agent to use the Terminal
        createTool({
          name: 'terminal',
          description: 'Use the terminal to run commands',
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run('terminal', async () => {
              const buffers = {
                stdout: '',
                stderr: '',
              };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (e) {
                console.log(
                  `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderror: ${buffers.stderr}`,
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout} \nstderror: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: 'createOrUpdateFiles',
          description: 'Create or update files in sandbox box',
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>,
          ) => {
            /**
             * return an object like
             * {
             * "/app.tsx":"<p> app page</p>,
             * "button.tsx":'<>'
             * "}
             **/
            const newFiles = await step?.run(
              'createOrUpdateFiles',
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (e) {
                  return 'Error: ' + e;
                }
              },
            );
            if (typeof newFiles === 'object') {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: 'readFiles',
          description: 'Read files from the sandbox',
          parameters: z.object({ files: z.array(z.string()) }),
          handler: async ({ files }, { step }) => {
            return await step?.run('readFiles', async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return 'Error:' + e;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes('<task_summary>')) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: 'coding-agent-network',
      agents: [codeAgent],
      // Limit how many loops an agent can do
      // After Max 15 iteration tell agent to stop
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, { state: state });

    const fragmentTitleGenerator = createAgent({
      name: 'fragment-title-generator',
      description: 'A fragment title generator',
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: 'gpt-4o',
      }),
    });

    const responseGenerator = createAgent({
      name: 'response-generator',
      description: 'A response  generator',
      system: RESPONSE_PROMPT,
      model: openai({
        model: 'gpt-4o',
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary,
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary,
    );

    const generateFragmentTitle = () => {
      const output = fragmentTitleOutput[0];

      if (output.type !== 'text') {
        return 'Fragment';
      }

      if (Array.isArray(output.content)) {
        return output.content.map((txt) => txt).join('');
      } else {
        return output.content;
      }
    };

    const generateResponse = () => {
      const output = responseOutput[0];

      if (output.type !== 'text') {
        return 'Here you go';
      }

      if (Array.isArray(output.content)) {
        return output.content.map((txt) => txt).join('');
      } else {
        return output.content;
      }
    };

    const isErorr =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000); // Assumes `compile_page.sh` starts server on port 3000
      return `https://${host}`;
    });

    await step.run('save-result', async () => {
      if (isErorr) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: 'Something went wrong . Please try agian, ',
            role: 'ASSISTANCE',
            type: 'ERROR',
          },
        });
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: 'ASSISTANCE',
          type: 'RESULT',
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: 'Fragment',
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
