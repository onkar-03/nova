import { Inngest } from 'inngest';

// Create a client to send and receive events
export const inngest = new Inngest({
  id: process.env.INNGEST_APP_ID ?? 'nova-development',
});
