import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';

export const appRouter = createTRPCRouter({
  // 1. Background job invocation
  invoke: baseProcedure
    .input(z.object({ value: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await inngest.send({
          name: 'test/hello.world',
          data: {
            value: input.value,
          },
        });
      } catch (error) {
        throw new Error(
          `Failed to send event: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }

      return { ok: `Event sent successfully` };
    }),

  // 2. Simple hello endpoint
  hello: baseProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `hello ${input.text}`,
      };
    }),
});

// Export API type
export type AppRouter = typeof appRouter;
