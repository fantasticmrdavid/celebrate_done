import {Checkbox, Dropdown, MenuProps, notification, Space, Tag, Tooltip,} from 'antd'
import classNames from 'classnames'
import React, {useContext, useEffect, useState} from 'react'
import {Todo, TODO_PRIORITY, TODO_SIZE, TODO_STATUS,} from '@/app/components/TodoItem/types'
import {
  CaretDownOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LoadingOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import styles from './todo.module.scss'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import axios from 'axios'
import ConfettiExplosion from 'react-confetti-explosion'
import TodoFormModal, {TodoModal_Mode,} from '@/app/components/TodoFormModal/TodoFormModal'
import {UserContext} from '@/app/contexts/User'
import {useDrag} from 'react-dnd'
import {DRAGGABLE_TYPE} from '@/app/constants/constants'
import {getEmptyImage} from 'react-dnd-html5-backend'

type TodoProps = {
  todo: Todo
  currentDate: string
  onAddProgress?: (t: Todo) => Promise<{ previousTodoList: unknown }>
  onComplete?: (t: Todo, status: TODO_STATUS) => Promise<{ previousTodoList: unknown }>
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
  const {
    todo,
    currentDate,
    onAddProgress,
    onComplete
  } = props
  const queryClient = useQueryClient()
  const { user } = useContext(UserContext)
  const [shouldAnimateCompleted, setShouldAnimateCompleted] =
    useState<boolean>(false)
  const [shouldAnimateDeleted, setShouldAnimateDeleted] =
    useState<boolean>(false)
  const [shouldAnimateFadeOut, setShouldAnimateFadeOut] =
    useState<boolean>(false)
  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)
  const [isExploding, setIsExploding] = useState<boolean>(false)

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: DRAGGABLE_TYPE.TODO,
    item: todo,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))
  const isDone = todo.status === TODO_STATUS.DONE

  useEffect(() => {
    if (isDone) setShouldAnimateCompleted(false)
    setShouldAnimateFadeOut(false)
  }, [isDone])

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

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
      const { status, action} = updateTodoParams
      const isDone = status === TODO_STATUS.DONE
      if (isDone) setIsExploding(true)
      setTimeout(() => {
        setIsExploding(false)
      }, 3000)

      if (action === "complete" && onComplete) {
        onComplete(todo, status || TODO_STATUS.INCOMPLETE)
      }
    },
    onError: (e) => {
      console.error('ERROR: ', e)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getTodos', currentDate],
      })
    },
  })

  const addTodoProgress = useMutation({
    mutationFn: () =>
      axios.post('/api/todos/progress', {
        name: todo.name,
        category: todo.category,
        user_id: user.uuid,
      }),
    onMutate: async () => {
      setIsExploding(true)
      setTimeout(() => {
        setIsExploding(false)
      }, 3000)

      if (onAddProgress) {
        onAddProgress({
          id: 9999,
          created: new Date().toISOString(),
          startDate: new Date().toISOString(),
          completedDateTime: new Date().toISOString(),
          name: `Chipped away at ${todo.name.trim()}`,
          notes: `I made progress on ${todo.name.trim()} today`,
          category: todo.category,
          size: TODO_SIZE.SMALL,
          priority: TODO_PRIORITY.NORMAL,
          sortOrder: 999,
          status: TODO_STATUS.DONE
        })
      }
    },
    onError: (e) => {
      console.error('ERROR: ', e)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getTodos'],
      })
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
      notification.error({
        message: <>Error deleting todo. Check console for details.</>,
      })
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
        <div onClick={() => addTodoProgress.mutate()}>
          <RiseOutlined /> I worked on this today
        </div>
      ),
    },
    {
      key: '4',
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

  const content = (
    <>
      {todo.name}{' '}
      <Tag color={sizeTags[todo.size].color}>{sizeTags[todo.size].label}</Tag>
      {todo.notes && (
        <Tooltip title={todo.notes}>
          <FileTextOutlined />
        </Tooltip>
      )}
    </>
  )

  return (
    <div
      ref={drag}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        opacity: isDragging ? 0 : 1,
      }}
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
          content
        ) : (
          <span style={{ textDecoration: 'line-through' }}>{content}</span>
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
