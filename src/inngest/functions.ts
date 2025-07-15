import { z } from 'zod';
import { Sandbox } from '@e2b/code-interpreter';
import {
  openai,
  createAgent,
  createTool,
  createNetwork,
} from '@inngest/agent-kit';

import { PROMPT } from '@/prompt';

import { inngest } from './client';
import { getSandbox, lastAssistantTextMessageContent } from './utils';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('nova-next-js-test-2');
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
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
        createTool({
          name: 'terminal',
          description: 'Use the Terminal to Run Commands',
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
          name: 'CreateOrUpdateFiles',
          description: 'Create or update files in sandbox box',
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            /**
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
                  return 'Error:' + e;
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
          description: 'Read files from sandbox',
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
            if (lastAssistantMessageText.includes('<tast_summary>')) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: 'code-agent-network',
      agents: [codeAgent],
      maxIter: 5,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.run);

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000); // Assumes `compile_page.sh` starts server on port 3000
      return `http://${host}`;
    });

    return {
      url: sandboxUrl,
      title: 'Fragment',
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
