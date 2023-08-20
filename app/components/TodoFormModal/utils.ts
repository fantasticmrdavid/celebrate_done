import { Todo } from '@prisma/client'

export type TodoValidation = {
  [key: string]: string
}

export const validateTodo = (t: Pick<Todo, 'name'>): TodoValidation => {
  let validation = {}
  if (t.name.length === 0) {
    validation = {
      ...validation,
      name: 'Please specify a name for the todo',
    }
  }

  return validation
}
