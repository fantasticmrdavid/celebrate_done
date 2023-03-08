export enum TODO_SIZE {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
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
  status: TODO_STATUS
  completedDateTime: string | undefined
  category_id: number
  category_name: string
  category_description: string
}

export type New_Todo = {
  id?: number
  category?: number
  startDate: string
  name: string
  size: TODO_SIZE
}
