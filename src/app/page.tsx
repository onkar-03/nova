import Client from './client';
import { trpc, getQueryClient } from '@/trpc/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

// --- Use TRPC in a server component
const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.hello.queryOptions({ text: 'Onkar Prefetch' }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

// --- Use TRPC in a client component
// 'use client';
// import { useTRPC } from '@/trpc/client';
// import { useQuery } from '@tanstack/react-query';

// const Page = () => {
//   // The API and its working (trpc)
//   // Simple Way to fetch data using client component
//   const trpc = useTRPC();
//   const { data, ...other } = useQuery(
//     trpc.hello.queryOptions({ text: 'Onkar' }),
//   );

//   return <div>{JSON.stringify(data)}</div>;
// };

// export default Page;
