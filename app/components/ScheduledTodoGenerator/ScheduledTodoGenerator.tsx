import { QueryKey, useQuery } from '@tanstack/react-query'

export const ScheduledTodoGenerator = () => {
  useQuery(
    ['generateScheduledTodos'] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos/generateScheduledTodos?tz=${
          Intl.DateTimeFormat().resolvedOptions().timeZone
        }`,
      ).then((res) => res.json()),
  )

  return null
}
