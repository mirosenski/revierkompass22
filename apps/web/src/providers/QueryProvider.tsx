import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Global default options
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
                        retry: (failureCount, error) => {
                                // Don't retry on 4xx errors
                                if (error instanceof Error && "status" in error) {
                                        interface ErrorWithStatus extends Error {
                                                status?: number;
                                        }
                                        const status = (error as ErrorWithStatus).status;
                                        if (status && status >= 400 && status < 500) {
                                                return false;
                                        }
                                }
                                return failureCount < 3;
                        },
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
		},
		mutations: {
			retry: 1,
		},
	},
});

interface QueryProviderProps {
	children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	);
}
