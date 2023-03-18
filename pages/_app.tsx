import React from 'react'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import 'antd/dist/reset.css'

import Head from 'next/head'

import { CategoriesProvider } from '@/app/contexts/Categories'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
        }}
      >
        <CategoriesProvider>
          <Head>
            <title>CelebrateDone</title>
          </Head>
          <Component {...pageProps} />
        </CategoriesProvider>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
