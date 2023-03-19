import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Layout, Menu, MenuProps, Space, Tooltip } from 'antd'
import CategoryFormModal, {
  CategoryModal_Mode,
} from '@/app/components/CategoryFormModal/CategoryFormModal'
import styles from './headerNav.module.scss'
import { FolderAddOutlined } from '@ant-design/icons'
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
  const [isCategoryFormModalOpen, setIsCategoryFormModalOpen] =
    useState<boolean>(false)
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
        <Tooltip title={'Add Category'}>
          <Button onClick={() => setIsCategoryFormModalOpen(true)}>
            <FolderAddOutlined />
          </Button>
        </Tooltip>
        <CategoryFormModal
          isOpen={isCategoryFormModalOpen}
          onCancel={() => setIsCategoryFormModalOpen(false)}
          mode={CategoryModal_Mode.ADD}
        />
      </Space>
    </Header>
  )
}

export default HeaderNav
