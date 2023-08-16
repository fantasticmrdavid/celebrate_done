import { Todo } from '@prisma/client'
import { TODO_PRIORITY, TODO_STATUS } from '@/app/components/TodoItem/utils'

export const dateIsoToSql = (d: string) => d.replace(/T|Z/g, ' ')

export const getSortedTodoList = (tList: Todo[]) => {
  return tList.sort((a, b) => {
    if (a.status === TODO_STATUS.DONE && b.status !== TODO_STATUS.DONE) return 1
    if (a.status !== TODO_STATUS.DONE && b.status === TODO_STATUS.DONE)
      return -1
    if (
      a.priority === TODO_PRIORITY.URGENT &&
      b.priority !== TODO_PRIORITY.URGENT
    )
      return -1
    if (
      a.priority !== TODO_PRIORITY.URGENT &&
      b.priority === TODO_PRIORITY.URGENT
    )
      return 1
    return a.sortOrder < b.sortOrder ? -1 : 1
  })
}
