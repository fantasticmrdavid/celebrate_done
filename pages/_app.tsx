import React from 'react'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, Layout, theme } from 'antd'
import 'antd/dist/reset.css'

import Head from 'next/head'

import { CategoriesProvider } from '@/app/contexts/Categories'
import HeaderNav from '@/app/components/HeaderNav/HeaderNav'

const { Content } = Layout

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <CategoriesProvider>
          <Head>
            <title>CelebrateDone</title>
          </Head>

          <Layout>
            <HeaderNav />
            <Content style={{ padding: '1em 3.5em' }}>
              <Component {...pageProps} />
            </Content>
            .
          </Layout>
        </CategoriesProvider>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
