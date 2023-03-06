import { Checkbox } from 'antd'
import React from 'react'
import { Todo, TODO_STATUS } from '@/app/components/TodoItem/types'

type TodoProps = {
  todo: Todo
  onChange: () => any
}

export const TodoItem = (props: TodoProps) => {
  const { todo, onChange } = props
  const isDone = todo.status === TODO_STATUS.DONE
  return (
    <div>
      <Checkbox checked={isDone} onChange={onChange} />{' '}
      {!isDone ? (
        todo.name
      ) : (
        <span style={{ textDecoration: 'line-through' }}>{todo.name}</span>
      )}
    </div>
  )
}
