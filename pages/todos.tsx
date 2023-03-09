import React, { useState } from 'react'
import { Button, Layout, Space, Typography } from 'antd'
import { TodoList } from '@/app/components/TodoList/TodoList'
import CategoryFormModal, {
  CategoryModal_Mode,
} from '@/app/components/CategoryFormModal/CategoryFormModal'

const { Header, Content } = Layout
const { Title } = Typography

export const TodosPage = () => {
  const [isCategoryFormModalOpen, setIsCategoryFormModalOpen] =
    useState<boolean>(false)
  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Title level={2}>{`To-Do's`}</Title>
        <Button onClick={() => setIsCategoryFormModalOpen(true)}>
          +Category
        </Button>
      </Header>
      <Content>
        <Space
          direction={'vertical'}
          size={'middle'}
          style={{ display: 'flex', padding: '1em' }}
        >
          <TodoList />
        </Space>
      </Content>
      <CategoryFormModal
        isOpen={isCategoryFormModalOpen}
        onCancel={() => setIsCategoryFormModalOpen(false)}
        mode={CategoryModal_Mode.ADD}
      />
    </Layout>
  )
}

export default TodosPage
