import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender } from "@testing-library/react";
import type { ReactElement } from "react";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

export function render(ui: ReactElement) {
  const queryClient = createTestQueryClient();
  return rtlRender(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

export * from "@testing-library/react";
