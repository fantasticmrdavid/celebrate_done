import React, { useState } from 'react'
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

export const HeaderNav = () => {
  const [isCategoryFormModalOpen, setIsCategoryFormModalOpen] =
    useState<boolean>(false)
  return (
    <Header className={styles.container}>
      <h2 className={styles.title}>celebrate.DONE</h2>
      <Space>
        <Menu className={styles.menu} items={menuItemList} theme={'dark'} />
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
