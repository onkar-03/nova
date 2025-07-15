import { inngest } from './client';
import { openai, createAgent } from '@inngest/agent-kit';
import { Sandbox } from '@e2b/code-interpreter';
import { getSandbox } from './utils';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('nova-next-js-test-2');
      return sandbox.sandboxId;
    });

    // Create a new agent with a system prompt (you can add optional tools, too)
    const codeAgent = createAgent({
      name: 'code-agent',
      system:
        'You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js & React snippets',
      model: openai({ model: 'gpt-4o' }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`,
    );

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);

      // In out compile_page.sh template we run on 3000 hence 3000

      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });
    return { output, sandboxUrl };
  },
);
