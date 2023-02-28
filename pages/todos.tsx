import React from 'react'
import { Layout, Space, Typography } from 'antd'
import { TodoList } from '@/app/components/TodoList/TodoList'
import AddTodoForm from '@/app/components/AddTodoForm/AddTodoForm'

const { Header, Content } = Layout
const { Title } = Typography

export const TodosPage = () => {
  return (
    <Layout>
      <Header>
        <Title level={2}>{`To-Do's`}</Title>
      </Header>
      <Content>
        <Space
          direction={'vertical'}
          size={'middle'}
          style={{ display: 'flex', padding: '1em' }}
        >
          <TodoList />
          <AddTodoForm />
        </Space>
      </Content>
    </Layout>
  )
}

export default TodosPage
