import { useContext } from 'react'
import { UserContext } from '@/app/contexts/User'
import { QueryKey, useQuery } from '@tanstack/react-query'

export const ScheduledTodoGenerator = () => {
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

  return null
}
