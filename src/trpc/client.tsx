'use client';
import superjson from 'superjson';
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
let browserQueryClient: QueryClient;
/**
 * Returns a React Query client instance appropriate for the current environment.
 *
 * On the server, always creates and returns a new client. On the browser, returns a singleton client instance, creating it if necessary.
 *
 * @returns The React Query client instance for the current environment.
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
/**
 * Returns the tRPC API endpoint URL, resolving to a relative path on the client and an absolute URL on the server.
 *
 * On the server, uses the `NEXT_PUBLIC_APP_URL` environment variable as the base URL; on the client, returns a relative path.
 *
 * @returns The tRPC API URL as a string
 */
function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';

    // Produciton URL set in .env file
    return process.env.NEXT_PUBLIC_APP_URL;
  })();
  return `${base}/api/trpc`;
}
/**
 * Provides React Query and tRPC context to its child components for seamless data fetching and caching.
 *
 * Wraps children with both React Query's `QueryClientProvider` and tRPC's `TRPCProvider`, ensuring a properly configured client environment for tRPC hooks and React Query in a Next.js application.
 */
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
