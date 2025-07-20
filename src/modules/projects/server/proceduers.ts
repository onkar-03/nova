import { z } from 'zod';

import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { generateSlug } from 'random-word-slugs';
// import { consumeCredits } from '@/lib/usage';

// Router to manage project-related queries and mutations
export const projectsRouter = createTRPCRouter({
  // GET / Get a single project by its ID
  getOne: protectedProcedure
    // Validate that an ID string is provided as input
    .input(
      z.object({
        id: z.string().min(1, { message: 'Id is required' }),
      }),
    )
    // Handle the query logic to fetch a project from the database
    .query(async ({ input, ctx }) => {
      const existingprojects = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      // Throw error if project not found
      if (!existingprojects) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return existingprojects;
    }),

  // GET / Get all projects, ordered by last update
  getMany: protectedProcedure
    // No input required for fetching all projects
    .query(async ({ ctx }) => {
      const projects = await prisma.project.findMany({
        where: {
          userId: ctx.auth.userId,
        },
        orderBy: { updatedAt: 'desc' },
      });
      return projects;
    }),

  // POST / Create a new project with an initial message
  create: protectedProcedure
    // Validate that a message value is provided for the new project
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Value is required' })
          .max(10000, { message: 'Value is too long' }),
      }),
    )
    // Mutation logic to insert a new project and trigger an async process
    .mutation(async ({ input, ctx }) => {
      // Robust error handling for credit consumption
      try {
        // Uncomment and use consumeCredits
        const { consumeCredits } = await import('@/lib/usage');
        await consumeCredits();
      } catch (err) {
        // Out of credits (rate-limiter-flexible throws a RateLimiterRes object)
        if (err && typeof err === 'object' && 'msBeforeNext' in err) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'You are out of credits',
          });
        }
        // Not authenticated or other error
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: err instanceof Error ? err.message : 'Something went wrong',
        });
      }

      // Create project with a random slug and one initial user message
      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: generateSlug(2, {
            format: 'kebab',
          }),
          messages: {
            create: {
              content: input.value,
              role: 'USER',
              type: 'RESULT',
            },
          },
        },
      });

      // Trigger background event via Inngest
      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      });

      return createdProject;
    }),
});
