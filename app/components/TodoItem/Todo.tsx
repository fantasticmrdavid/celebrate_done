import { Checkbox, Dropdown, MenuProps, Tag } from 'antd'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import {
  Todo,
  TODO_PRIORITY,
  TODO_SIZE,
  TODO_STATUS,
} from '@/app/components/TodoItem/types'
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
} from '@ant-design/icons'
import styles from './todo.module.scss'

type TodoProps = {
  todo: Todo
  onChange: () => any
  onEdit: () => any
  onDelete: () => any
}

const sizeTags = {
  [TODO_SIZE.SMALL]: {
    label: 'S',
    color: 'green',
  },
  [TODO_SIZE.MEDIUM]: {
    label: 'M',
    color: 'orange',
  },
  [TODO_SIZE.LARGE]: {
    label: 'L',
    color: 'purple',
  },
}

export const TodoItem = (props: TodoProps) => {
  const [shouldAnimateCompleted, setShouldAnimateCompleted] =
    useState<boolean>(false)
  const [shouldAnimateDeleted, setShouldAnimateDeleted] =
    useState<boolean>(false)
  const [shouldAnimateFadeOut, setShouldAnimateFadeOut] =
    useState<boolean>(false)
  const { todo, onChange, onEdit, onDelete } = props
  const isDone = todo.status === TODO_STATUS.DONE

  useEffect(() => {
    if (isDone) setShouldAnimateCompleted(false)
    setShouldAnimateFadeOut(false)
  }, [isDone])

  const actionList: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div onClick={() => onEdit()}>
          <EditOutlined /> Edit
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div
          onClick={() => {
            setShouldAnimateFadeOut(true)
            setShouldAnimateDeleted(true)
            onDelete()
          }}
        >
          <DeleteOutlined /> Delete
        </div>
      ),
    },
  ]
  const containerClassNames = classNames({
    [styles.container]: true,
    [styles.isCompleted]: shouldAnimateCompleted,
    [styles.isDeleted]: shouldAnimateDeleted,
    [styles.fadeOut]: shouldAnimateFadeOut,
    [styles.isUrgent]:
      todo.priority === TODO_PRIORITY.URGENT &&
      todo.status !== TODO_STATUS.DONE,
  })
  return (
    <div
      style={{ display: 'flex', justifyContent: 'space-between' }}
      className={containerClassNames}
    >
      <div>
        <Checkbox
          checked={isDone}
          onChange={() => {
            setShouldAnimateFadeOut(true)
            setShouldAnimateCompleted(!isDone)
            onChange()
          }}
        />{' '}
        {!isDone ? (
          <>
            {todo.name}{' '}
            <Tag color={sizeTags[todo.size].color}>
              {sizeTags[todo.size].label}
            </Tag>
          </>
        ) : (
          <span style={{ textDecoration: 'line-through' }}>
            {todo.name}{' '}
            <Tag color={sizeTags[todo.size].color}>
              {sizeTags[todo.size].label}
            </Tag>
          </span>
        )}
      </div>
      <div className={styles.actions}>
        <Dropdown
          trigger={['click']}
          placement={'bottomLeft'}
          menu={{ items: actionList }}
        >
          <EllipsisOutlined />
        </Dropdown>
      </div>
    </div>
  )
}
