import React from 'react'
import { Layout } from 'antd'
import { CategoriesProvider } from '@/app/contexts/Categories'
import { SelectedDateProvider } from '@/app/contexts/SelectedDate'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import HeaderNav from '@/app/components/HeaderNav/HeaderNav'
import { Footer } from '@/app/components/Footer/Footer'
import { useSession } from 'next-auth/react'
import Head from 'next/head'

import styles from './template.module.scss'
import { LoadingSpinner } from '@/app/components/LoadingSpinner/LoadingSpinner'

const { Content } = Layout

type RootLayoutProps = {
  children: React.ReactNode
}

export const Template = ({ children }: RootLayoutProps) => {
  const { data: session, status: sessionStatus } = useSession()

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

  if (sessionStatus === 'loading')
    return (
      <div className={styles.centeredContent} style={{ gap: '0.5em' }}>
        <LoadingSpinner />
      </div>
    )

  if (session && session.user) {
    return (
      <SelectedDateProvider>
        <CategoriesProvider>
          {head}
          <DndProvider backend={HTML5Backend}>
            <Layout>
              <div className={styles.layout}>
                <HeaderNav />
                <Content className={styles.content}>{children}</Content>
                <Footer />
              </div>
            </Layout>
          </DndProvider>
        </CategoriesProvider>
      </SelectedDateProvider>
    )
  }

  return (
    <>
      {head}
      <Layout>
        <Content className={styles.centeredContent}>
          <Content className={styles.content}>{children}</Content>
        </Content>
      </Layout>
    </>
  )
}
