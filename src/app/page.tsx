'use client';

import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

const Page = () => {
  const [value, setValue] = useState('');

  const trpc = useTRPC();
  const invoke = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: () => {
        toast.success('Background job invoked successfully!');
      },
      onError: (err) => {
        toast.error(`❌ Failed to invoke: ${err.message}`);
      },
    }),
  );

  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></Input>
      <Button
        disabled={invoke.isPending}
        onClick={() => {
          invoke.mutate({ value: value });
        }}
      >
        Invoke Background Job
      </Button>
    </div>
  );
};

export default Page;

// import Client from './client';
// import { trpc, getQueryClient } from '@/trpc/server';
// import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
// import { Suspense } from 'react';

// // --- Use TRPC in a server component
// const Page = async () => {
//   const queryClient = getQueryClient();
//   void queryClient.prefetchQuery(
//     trpc.hello.queryOptions({ text: 'Onkar Prefetch' }),
//   );

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <Suspense fallback={<p>Loading...</p>}>
//         <Client />
//       </Suspense>
//     </HydrationBoundary>
//   );
// };

// export default Page;

// --- Use TRPC in Server Component
// import Client from './client';
// import { trpc, getQueryClient } from '@/trpc/server';
// import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
// import { Suspense } from 'react';

// // --- Use TRPC in a server component
// const Page = async () => {
//   const queryClient = getQueryClient();
//   void queryClient.prefetchQuery(
//     trpc.hello.queryOptions({ text: 'Onkar Prefetch' }),
//   );

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <Suspense fallback={<p>Loading...</p>}>
//         <Client />
//       </Suspense>
//     </HydrationBoundary>
//   );
// };

// export default Page;

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
