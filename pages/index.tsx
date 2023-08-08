import React from 'react'
import { TodosPage } from './todos'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { UserContext } from '@/app/contexts/User'

const IndexPage = () => {
  const { user } = useContext(UserContext)
  useQuery(
    ['generateScheduledTodos'] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos/generateScheduledTodos?user_id=${user?.uuid || ''}&tz=${
          Intl.DateTimeFormat().resolvedOptions().timeZone
        }`,
      ).then((res) => res.json()),
  )

  return <TodosPage />
}

export default IndexPage
