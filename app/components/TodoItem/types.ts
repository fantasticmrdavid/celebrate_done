import { Category } from '@/app/components/Category/types'

export enum TODO_SIZE {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export enum TODO_PRIORITY {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
}

export enum TODO_STATUS {
  INCOMPLETE = 'INCOMPLETE',
  DONE = 'DONE',
}

export type Todo = {
  id: number
  created: string
  startDate: string
  name: string
  description: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
  status: TODO_STATUS
  completedDateTime: string | undefined
  category: Category
}

export type New_Todo = {
  id?: number
  category?: number
  startDate: string
  name: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
}
