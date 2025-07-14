import { inngest } from './client';
import { openai, createAgent } from '@inngest/agent-kit';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event }) => {
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

    console.log(output);

    return { output };
  },
);
