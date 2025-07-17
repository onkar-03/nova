import { z } from 'zod';

import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { createTRPCRouter, baseProcedure } from '@/trpc/init';

// Router to manage messages (fetching and creating) scoped to a specific project
export const messagesRouter = createTRPCRouter({
  // 📥 Get all messages for a specific project
  getMany: baseProcedure
    // Validate that a non-empty projectId is provided
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project ID is required' }),
      }),
    )
    // Fetch messages linked to the given projectId, ordered by most recently updated
    .query(async ({ input }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          // Include related fragments
          fragment: true,
        },
        orderBy: { updatedAt: 'asc' },
      });
      return messages;
    }),

  // Create a new message for a specific project
  create: baseProcedure
    // Validate input for message content and associated projectId
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Value is required' })
          .max(10000, { message: 'Value is too long' }),
        projectId: z.string().min(1, { message: 'Project ID is required' }),
      }),
    )
    // Create the message in the DB and trigger an async event via Inngest
    .mutation(async ({ input }) => {
      // Create the message in the database
      const createdMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: input.value,
          role: 'USER',
          type: 'RESULT',
        },
      });

      // Trigger background task to process the message via Inngest
      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });

      return createdMessage;
    }),
});
