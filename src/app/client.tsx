'use client;';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

const Client = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.hello.queryOptions({ text: 'Onkar Prefetch' }),
  );

  return <div>{JSON.stringify(data)}</div>;
};

export default Client;
