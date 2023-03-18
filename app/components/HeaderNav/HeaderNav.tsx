import React, { useState } from 'react'
import { Button, Layout, Tooltip } from 'antd'
import CategoryFormModal, {
  CategoryModal_Mode,
} from '@/app/components/CategoryFormModal/CategoryFormModal'
import styles from './headerNav.module.scss'
import { FolderAddOutlined } from '@ant-design/icons'

const { Header } = Layout

export const HeaderNav = () => {
  const [isCategoryFormModalOpen, setIsCategoryFormModalOpen] =
    useState<boolean>(false)
  return (
    <Header className={styles.container}>
      <h2 className={styles.title}>celebrate.DONE</h2>
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
    </Header>
  )
}

export default HeaderNav
