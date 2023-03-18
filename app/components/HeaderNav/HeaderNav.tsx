import React, { useState } from 'react'
import { Button, Layout } from 'antd'
import CategoryFormModal, {
  CategoryModal_Mode,
} from '@/app/components/CategoryFormModal/CategoryFormModal'
import styles from './headerNav.module.scss'

const { Header } = Layout

export const HeaderNav = () => {
  const [isCategoryFormModalOpen, setIsCategoryFormModalOpen] =
    useState<boolean>(false)
  return (
    <Header className={styles.container}>
      <h2 className={styles.title}>celebrate.DONE</h2>
      <Button onClick={() => setIsCategoryFormModalOpen(true)}>
        + Category
      </Button>
      <CategoryFormModal
        isOpen={isCategoryFormModalOpen}
        onCancel={() => setIsCategoryFormModalOpen(false)}
        mode={CategoryModal_Mode.ADD}
      />
    </Header>
  )
}

export default HeaderNav
