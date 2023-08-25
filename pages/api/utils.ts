import { Todo, TodoPriority, TodoStatus } from '@prisma/client'

export const getSortedTodoList = (tList: Omit<Todo, 'userId'>[]) => {
  return tList.sort((a, b) => {
    if (a.status === TodoStatus.DONE && b.status !== TodoStatus.DONE) return 1
    if (a.status !== TodoStatus.DONE && b.status === TodoStatus.DONE) return -1
    if (
      a.priority === TodoPriority.URGENT &&
      b.priority !== TodoPriority.URGENT
    )
      return -1
    if (
      a.priority !== TodoPriority.URGENT &&
      b.priority === TodoPriority.URGENT
    )
      return 1
    return a.sortOrder > b.sortOrder ? -1 : 1
  })
}
