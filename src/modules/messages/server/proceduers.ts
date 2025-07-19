import { z } from 'zod';

import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';

// Router to manage messages (fetching and creating) scoped to a specific project
export const messagesRouter = createTRPCRouter({
  // 📥 Get all messages for a specific project
  getMany: protectedProcedure
    // Validate that a non-empty projectId is provided
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project ID is required' }),
      }),
    )
    // Fetch messages linked to the given projectId, ordered by most recently updated
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            // Ensure messages belong to the authenticated user
            userId: ctx.auth.userId,
          },
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
  create: protectedProcedure
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
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      // Create the message in the database
      const createdMessage = await prisma.message.create({
        data: {
          projectId: existingProject.id,
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
