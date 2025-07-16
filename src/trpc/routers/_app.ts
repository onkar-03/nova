import { projectsRouter } from '@/modules/projects/server/proceduers';
import { messagesRouter } from '@/modules/messages/server/proceduers';

import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
