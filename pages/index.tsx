import React from 'react'
import { TodosPage } from './todos'
import { ScheduledTodoGenerator } from '@/app/components/ScheduledTodoGenerator/ScheduledTodoGenerator'
import { useSession } from 'next-auth/react'
import { LoginPage } from '@/pages/login'

const IndexPage = () => {
  const { data: session } = useSession()

  if (!session?.user) {
    return <LoginPage />
  }

  return (
    <>
      <TodosPage />
      {/*<ScheduledTodoGenerator />*/}
    </>
  )
}

export default IndexPage
