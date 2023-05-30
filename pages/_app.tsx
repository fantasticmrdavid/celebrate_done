import React, { useEffect, useState } from 'react'
import { getCookie, setCookie } from 'cookies-next'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, Layout } from 'antd'
import 'antd/dist/reset.css'
import styles from './styles.module.scss'
import '../styles/globals.css'

import Head from 'next/head'

import { CategoriesProvider } from '@/app/contexts/Categories'
import HeaderNav from '@/app/components/HeaderNav/HeaderNav'
import { UserProvider } from '@/app/contexts/User'
import { UserSelector } from '@/app/components/UserSelector/UserSelector'

import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import { COOKIE_NAME } from '@/app/constants/constants'

import { DndProvider } from 'react-dnd'
import { TouchBackend  } from 'react-dnd-touch-backend'
import {HTML5Backend} from "react-dnd-html5-backend";
import {isMobile} from 'react-device-detect';

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  weekStart: 1,
})

const { Content } = Layout

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())
  const [uuid, setUuid] = useState<string>()

  const cookieRaw = getCookie(COOKIE_NAME) || ''

  useEffect(() => {
    if (!cookieRaw) {
      setUuid(undefined)
    } else {
      const cookie = JSON.parse(cookieRaw as string)
      setUuid(cookie.uuid as string)
    }
  }, [cookieRaw])

  const head = (
    <Head>
      <title>celebrate.DONE 🎉</title>
      <meta name={'viewport'} content="width=device-width, initial-scale=1" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android-chrome-192x192.png"
      />
    </Head>
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        {uuid ? (
          <UserProvider uuid={uuid}>
            <CategoriesProvider>
              {head}
                <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
                  <Layout>
                    <HeaderNav />
                    <Content className={styles.content}>
                      <Component {...pageProps} />
                    </Content>
                  </Layout>
                </DndProvider>
            </CategoriesProvider>
          </UserProvider>
        ) : (
          <>
            {head}
            <Layout>
              <Content className={styles.centeredContent}>
                <UserSelector
                  onSelect={(uuid) => {
                    setCookie(COOKIE_NAME, { uuid })
                    setUuid(uuid)
                  }}
                />
              </Content>
            </Layout>
          </>
        )}
      </ConfigProvider>
    </QueryClientProvider>
  )
}
