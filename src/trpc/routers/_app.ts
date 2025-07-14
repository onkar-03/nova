import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';

export const appRouter = createTRPCRouter({
  // Invoke the background Job from TRPC
  invoke: baseProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await inngest.send({
          name: 'test/hello.world',
          data: {
            text: input.text, // Changed from 'email' to 'text' for semantic clarity
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

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
