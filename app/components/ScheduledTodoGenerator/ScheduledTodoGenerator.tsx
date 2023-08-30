import { QueryKey, useQuery } from '@tanstack/react-query'

const REFETCH_INTERVAL_MS = 30000

export const ScheduledTodoGenerator = () => {
  useQuery({
    queryKey: ['generateScheduledTodos'] as unknown as QueryKey,
    queryFn: async () =>
      await fetch(
        `/api/todos/generateScheduledTodos?tz=${
          Intl.DateTimeFormat().resolvedOptions().timeZone
        }`,
      ),
    staleTime: REFETCH_INTERVAL_MS,
  })

  return null
}
