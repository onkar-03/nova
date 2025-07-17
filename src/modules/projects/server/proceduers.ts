import { z } from 'zod';

import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { createTRPCRouter, baseProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { generateSlug } from 'random-word-slugs';

export const projectsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: 'Id is requierd' }),
      }),
    )
    .query(async ({ input }) => {
      const existingprojects = await prisma.project.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existingprojects) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      return existingprojects;
    }),
  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return projects;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Value is required' })
          .max(10000, { message: 'Value is too long' }),
      }),
    )
    .mutation(async ({ input }) => {
      const createdProject = await prisma.project.create({
        data: {
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
