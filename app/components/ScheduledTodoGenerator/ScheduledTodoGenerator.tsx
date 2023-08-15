import { QueryKey, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export const ScheduledTodoGenerator = () => {
  const { data: session } = useSession()
  useQuery(
    ['generateScheduledTodos'] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos/generateScheduledTodos?user_id=${
          session?.user?.id || ''
        }&tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      ).then((res) => res.json()),
  )

  return null
}
