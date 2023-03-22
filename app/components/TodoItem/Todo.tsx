import { Checkbox, Dropdown, MenuProps, notification, Space, Tag } from 'antd'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import {
  Todo,
  TODO_PRIORITY,
  TODO_SIZE,
  TODO_STATUS,
} from '@/app/components/TodoItem/types'
import {
  CaretDownOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import styles from './todo.module.scss'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import ConfettiExplosion from 'react-confetti-explosion'
import TodoFormModal, {
  TodoModal_Mode,
} from '@/app/components/TodoFormModal/TodoFormModal'

type TodoProps = {
  todo: Todo
  currentDate: string
}

type Update_Todo_Params = {
  action: string
  id: number
  status?: TODO_STATUS
  completedDateTime?: string | undefined
  priority?: TODO_PRIORITY
}

export const sizeTags = {
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
  const queryClient = useQueryClient()
  const [shouldAnimateCompleted, setShouldAnimateCompleted] =
    useState<boolean>(false)
  const [shouldAnimateDeleted, setShouldAnimateDeleted] =
    useState<boolean>(false)
  const [shouldAnimateFadeOut, setShouldAnimateFadeOut] =
    useState<boolean>(false)
  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)
  const [isExploding, setIsExploding] = useState<boolean>(false)

  const { todo, currentDate } = props
  const isDone = todo.status === TODO_STATUS.DONE

  useEffect(() => {
    if (isDone) setShouldAnimateCompleted(false)
    setShouldAnimateFadeOut(false)
  }, [isDone])

  const updateTodo = useMutation({
    mutationFn: (req: Update_Todo_Params) =>
      axios.patch('/api/todos', {
        action: req.action,
        id: req.id,
        status: req.status,
        completedDateTime: req.completedDateTime,
        priority: req.priority,
      }),
    onMutate: async (updateTodoParams) => {
      const isDone = updateTodoParams.status === TODO_STATUS.DONE
      if (isDone) setIsExploding(true)
      setTimeout(() => {
        setIsExploding(false)
      }, 3000)
    },
    onError: (e) => {
      console.error('ERROR: ', e)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    },
  })

  const deleteTodo = useMutation({
    mutationFn: () => axios.delete(`/api/todos/${todo.id}`),
    onSuccess: () => {
      notification.success({
        message: 'Task deleted.',
      })
    },
    onError: (e) => {
      console.error('ERROR: ', e)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    },
  })

  const toggleCompleted = () => {
    const shouldMarkCompleted = todo.status !== TODO_STATUS.DONE
    updateTodo.mutate({
      action: 'complete',
      id: todo.id,
      status: shouldMarkCompleted ? TODO_STATUS.DONE : TODO_STATUS.INCOMPLETE,
      completedDateTime: shouldMarkCompleted
        ? new Date().toISOString()
        : undefined,
    })
  }

  const togglePriority = () => {
    updateTodo.mutate({
      action: 'togglePriority',
      id: todo.id,
      priority: todo.priority,
    })
  }

  const actionList: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div onClick={() => setIsTodoModalOpen(true)}>
          <EditOutlined /> Edit
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div onClick={() => togglePriority()}>
          {todo.priority === TODO_PRIORITY.NORMAL && (
            <>
              <ExclamationCircleOutlined /> Mark Urgent
            </>
          )}
          {todo.priority === TODO_PRIORITY.URGENT && (
            <>
              <CaretDownOutlined /> Unmark Urgent
            </>
          )}
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div
          style={{ color: 'red' }}
          onClick={() => {
            setShouldAnimateFadeOut(true)
            setShouldAnimateDeleted(true)
            deleteTodo.mutate()
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
    [styles.isUrgent]:
      todo.priority === TODO_PRIORITY.URGENT &&
      todo.status !== TODO_STATUS.DONE,
  })

  const labelClassNames = classNames({
    [styles.fadeOut]: shouldAnimateFadeOut,
  })
  return (
    <div
      style={{ display: 'flex', justifyContent: 'space-between' }}
      className={containerClassNames}
    >
      <Space
        style={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        {isExploding && (
          <ConfettiExplosion duration={3000} particleCount={100} width={1600} />
        )}
      </Space>
      <div className={labelClassNames}>
        <Checkbox
          checked={isDone}
          onChange={() => {
            setShouldAnimateFadeOut(true)
            setShouldAnimateCompleted(!isDone)
            toggleCompleted()
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
      {!updateTodo.isLoading && (
        <div className={styles.actions}>
          {updateTodo.isLoading ? (
            <LoadingOutlined />
          ) : (
            <Dropdown
              trigger={['click']}
              placement={'bottomLeft'}
              menu={{ items: actionList }}
            >
              <EllipsisOutlined />
            </Dropdown>
          )}
        </div>
      )}
      {updateTodo.isLoading && <LoadingOutlined />}
      {isTodoModalOpen && (
        <TodoFormModal
          isOpen={true}
          onCancel={() => {
            setIsTodoModalOpen(false)
          }}
          mode={TodoModal_Mode.EDIT}
          todo={todo}
        />
      )}
    </div>
  )
}
