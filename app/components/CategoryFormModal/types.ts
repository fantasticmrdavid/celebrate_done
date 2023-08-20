import { Todo } from '@prisma/client'

export type Category = {
  id: string
  color: string
  name: string
  description: string
  maxPerDay?: number
  sortOrder: number
  userId: string
  todos: Todo[]
}
