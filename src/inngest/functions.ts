import { inngest } from './client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    // Imagine a trasnscribe the video step
    await step.sleep('transcribe-video', '10s');

    // Imagine it as s summary step
    await step.sleep('generate-summary', '5s');
    return { message: `Hello ${event.data.email}!` };
  },
);
