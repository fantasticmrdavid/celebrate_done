import React from 'react'
import { useRouter } from 'next/router'
import { Layout, Menu, MenuProps, Space, Tooltip } from 'antd'
import styles from './headerNav.module.scss'
import Link from 'next/link'

const { Header } = Layout

const menuItemList: MenuProps['items'] = [
  {
    label: <Link href={'/'}>To Do</Link>,
    key: 'todo',
  },
  {
    label: <Link href={'/done'}>Done</Link>,
    key: 'done',
  },
]

const menuKeysToRoutes = [
  {
    key: 'todo',
    route: '/',
  },
  {
    key: 'done',
    route: '/done',
  },
]

export const HeaderNav = () => {
  const router = useRouter()
  return (
    <Header className={styles.container}>
      <h2 className={styles.title}>celebrate.DONE</h2>
      <Space>
        <Menu
          className={styles.menu}
          items={menuItemList}
          theme={'dark'}
          selectedKeys={menuKeysToRoutes
            .filter((mk) => router.route === mk.route)
            .map((i) => i.key)}
        />
      </Space>
    </Header>
  )
}

export default HeaderNav
