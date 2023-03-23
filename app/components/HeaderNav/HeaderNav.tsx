import React, { useContext } from 'react'
import { useRouter } from 'next/router'
import { Divider, Layout, Menu, MenuProps, Space, Tooltip } from 'antd'
import styles from './headerNav.module.scss'
import Link from 'next/link'
import { UserContext } from '@/app/contexts/User'

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
  const { user, isFetchingUser } = useContext(UserContext)
  const router = useRouter()
  if (isFetchingUser) return null
  return (
    <Space className={styles.container}>
      <h2 className={styles.title}>celebrate.DONE 🎉</h2>
      <Space>
        <Menu
          className={styles.menu}
          items={menuItemList}
          theme={'dark'}
          selectedKeys={menuKeysToRoutes
            .filter((mk) => router.route === mk.route)
            .map((i) => i.key)}
        />
        <div className={styles.user}>{user.username}</div>
      </Space>
    </Space>
  )
}

export default HeaderNav
