import {
  TODO_STATUS,
  TODO_SIZE,
  TODO_PRIORITY,
  TODO_REPEAT_FREQUENCY,
} from './utils'
import { Category } from '@/app/components/CategoryFormModal/types'

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
