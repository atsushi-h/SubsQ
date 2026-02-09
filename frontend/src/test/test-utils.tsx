import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement } from 'react'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const testQueryClient = createTestQueryClient()

  return <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render, createTestQueryClient }
