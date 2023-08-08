import React from 'react'
import { TodosPage } from './todos'
import { ScheduledTodoGenerator } from '@/app/components/ScheduledTodoGenerator/ScheduledTodoGenerator'

const IndexPage = () => {
  return (
    <>
      <TodosPage />
      <ScheduledTodoGenerator />
    </>
  )
}

export default IndexPage
