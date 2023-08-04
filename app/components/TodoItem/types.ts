import { Category } from '@/app/components/CategoryFormModal/types'

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

export enum TODO_REPEAT_FREQUENCY {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  FORTNIGHTLY = 'FORTNIGHTLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
}

export type Todo = {
  id: number
  uuid: string
  created: string
  startDate: string
  name: string
  notes: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
  status: TODO_STATUS
  completedDateTime: string | undefined
  sortOrder: number
  category: Category
  isRecurring: boolean
  repeats?: TODO_REPEAT_FREQUENCY
}

export type New_Todo = {
  id?: number
  category?: number
  startDate: string
  name: string
  size: TODO_SIZE
  isRecurring: boolean
  repeats?: TODO_REPEAT_FREQUENCY
  priority: TODO_PRIORITY
}
