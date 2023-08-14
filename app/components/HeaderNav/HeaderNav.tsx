import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Dropdown, Menu, MenuProps, Space } from 'antd'
import styles from './headerNav.module.scss'
import Link from 'next/link'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { GiGlassCelebration } from 'react-icons/gi'
import { useSession } from 'next-auth/react'

const menuItemList: MenuProps['items'] = [
  {
    label: <Link href={'/'}>To Do</Link>,
    key: 'todo',
  },
  {
    label: <Link href={'/done'}>Done</Link>,
    key: 'done',
  },
  {
    label: <Link href={'/coming-up'}>Coming Up</Link>,
    key: 'coming-up',
  },
]

const menuKeysToRoutes = [
  {
    key: 'today',
    route: '/today',
  },
  {
    key: 'todo',
    route: '/',
  },
  {
    key: 'done',
    route: '/done',
  },
  {
    key: 'coming-up',
    route: '/coming-up',
  },
]

export const HeaderNav = () => {
  const queryClient = useQueryClient()
  const [isUserMenuCollapsed, setIsUserMenuCollapsed] = useState<boolean>(true)
  const { data: session } = useSession()
  const router = useRouter()
  if (!session || !session.user) return null
  return (
    <Space className={styles.container}>
      <Space className={styles.contentWrapper}>
        <h2 className={styles.title}>
          celebrate.DONE
          <div className={styles.logoIcon}>
            <GiGlassCelebration />
          </div>
        </h2>
        <Space>
          <Menu
            className={styles.menu}
            items={menuItemList}
            theme={'dark'}
            selectedKeys={menuKeysToRoutes
              .filter((mk) => router.route === mk.route)
              .map((i) => i.key)}
          />
          <div className={styles.user}>
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    label: (
                      <div
                        onClick={() => {
                          queryClient.clear()
                          router.push('./')
                        }}
                      >
                        <LogoutOutlined /> Logout {session.user.email}
                      </div>
                    ),
                    key: '1',
                  },
                ],
              }}
            >
              <UserOutlined
                onClick={() => setIsUserMenuCollapsed(!isUserMenuCollapsed)}
              />
            </Dropdown>
          </div>
        </Space>
      </Space>
    </Space>
  )
}

export default HeaderNav
