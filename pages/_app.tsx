import React, { useState } from 'react'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, Layout } from 'antd'
import 'antd/dist/reset.css'

import Head from 'next/head'

import { CategoriesProvider } from '@/app/contexts/Categories'
import HeaderNav from '@/app/components/HeaderNav/HeaderNav'
import { UserProvider } from '@/app/contexts/User'
import { UserSelector } from '@/app/components/UserSelector/UserSelector'

const { Content } = Layout

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient())
  const [uuid, setUuid] = useState<string>()

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <CategoriesProvider>
          <Head>
            <title>CelebrateDone</title>
          </Head>

          <Layout>
            {uuid ? (
              <UserProvider uuid={uuid}>
                <HeaderNav />
                <Content style={{ padding: '1em 3.5em' }}>
                  <Component {...pageProps} />
                </Content>
              </UserProvider>
            ) : (
              <UserSelector onSelect={(uuid) => setUuid(uuid)} />
            )}
          </Layout>
        </CategoriesProvider>
      </ConfigProvider>
    </QueryClientProvider>
  )
}
