import React from 'react'
import { Space } from 'antd'
import { CategoryCards } from '@/app/components/CategoryCards/CategoryCards'

export const TodosPage = () => {
  return (
    <Space direction={'vertical'} size={'middle'}>
      <CategoryCards />
    </Space>
  )
}

export default TodosPage
