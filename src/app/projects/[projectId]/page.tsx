import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient, trpc } from '@/trpc/server';
import ProjectView from '@/modules/projects/ui/views/project-view';

interface Props {
  params: Promise<{
    projectId: string;
  }>;
}

// Server component for displaying a specific project page
const Page = async ({ params }: Props) => {
  const { projectId } = await params;

  // Created a query client instance for managing server-side prefetching
  const queryClient = getQueryClient();

  // Prefetch messages related to this project
  void queryClient.prefetchQuery(
    trpc.messages.getMany.queryOptions({
      projectId,
    }),
  );

  // Prefetch project details
  void queryClient.prefetchQuery(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    }),
  );

  // Return the component with pre-fetched data hydrated into the client cache
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Show fallback UI while the component is being streamed or loaded */}
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectView projectId={projectId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
