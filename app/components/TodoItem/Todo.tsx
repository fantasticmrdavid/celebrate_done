import {Checkbox, Dropdown, MenuProps} from 'antd'
import React from 'react'
import { Todo, TODO_STATUS } from '@/app/components/TodoItem/types'
import {DeleteOutlined, EditOutlined, EllipsisOutlined} from "@ant-design/icons";
import styles from "./todo.module.scss"

type TodoProps = {
  todo: Todo
  onChange: () => any
  onEdit: () => any
  onDelete: () => any
}

export const TodoItem = (props: TodoProps) => {
  const { todo, onChange, onEdit, onDelete } = props
  const isDone = todo.status === TODO_STATUS.DONE
  const actionList: MenuProps['items'] = [
    {
      key: '1',
      label: <div onClick={() => onEdit()}><EditOutlined /> Edit</div>
    },
    {
      key: '2',
      label: <div onClick={() => onDelete()}><DeleteOutlined /> Delete</div>
    },
  ]
  return (
    <div style={{ display: "flex", justifyContent: "space-between"}} className={styles.container}>
      <div>
        <Checkbox checked={isDone} onChange={onChange} />{' '}
        {!isDone ? (
          todo.name
        ) : (
          <span style={{ textDecoration: 'line-through' }}>{todo.name}</span>
        )}
      </div>
      <div className={styles.actions}>
        <Dropdown
          trigger={["click"]}
          placement={"bottomLeft"}
          menu={{ items: actionList }}
        >
          <EllipsisOutlined />
        </Dropdown>
      </div>
    </div>
  )
}
