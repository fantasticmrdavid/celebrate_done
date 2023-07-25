import { Checkbox, Dropdown, MenuProps, notification, Tag, Tooltip } from 'antd'
import classNames from 'classnames'
import React, { memo, useContext, useEffect, useRef, useState } from 'react'
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
  FileTextOutlined,
  LoadingOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import styles from './todo.module.scss'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import TodoFormModal, {
  TodoModal_Mode,
} from '@/app/components/TodoFormModal/TodoFormModal'
import { UserContext } from '@/app/contexts/User'
import { useDrag, useDrop, XYCoord } from 'react-dnd'
import { DRAGGABLE_TYPE } from '@/app/constants/constants'
import { Identifier } from 'dnd-core'

type TodoProps = {
  todo: Todo
  index: number
  currentDate: string
  onDrag: (dragIndex: number, hoverIndex: number) => void
  onSort?: () => void
  onAddProgress?: (t: Todo) => Promise<{ previousTodoList: unknown }>
  onComplete?: (
    t: Todo,
    status: TODO_STATUS,
  ) => Promise<{ previousTodoList: unknown }>
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

type DragItem = {
  index: number
  id: number
  type: string
}

export const UnmemoizedTodoItem = (props: TodoProps) => {
  const {
    todo,
    currentDate,
    index,
    onDrag,
    onSort,
    onAddProgress,
    onComplete,
  } = props
  const ref = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { user } = useContext(UserContext)
  const [shouldAnimateCompleted, setShouldAnimateCompleted] =
    useState<boolean>(false)
  const [shouldAnimateDeleted, setShouldAnimateDeleted] =
    useState<boolean>(false)
  const [shouldAnimateFadeOut, setShouldAnimateFadeOut] =
    useState<boolean>(false)
  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >(() => ({
    accept: DRAGGABLE_TYPE.TODO,
    drop: () => {
      if (onSort) onSort()
    },
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover: (item: DragItem, monitor) => {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      onDrag(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  }))

  const [{ isDragging }, drag] = useDrag({
    type: DRAGGABLE_TYPE.TODO,
    item: () => ({ ...todo, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
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
      const { status, action } = updateTodoParams
      if (action === 'complete' && onComplete) {
        onComplete(todo, status || TODO_STATUS.INCOMPLETE)
      }
    },
    onError: (e) => {
      console.error('ERROR: ', e)
    },
    onSettled: () => {
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
          status: TODO_STATUS.DONE,
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
    onMutate: async () => {
      await queryClient.cancelQueries(['getTodos', currentDate])
      const previousTodoList: Todo[] =
        queryClient.getQueryData(['getTodos', currentDate]) || []
      queryClient.setQueryData(
        ['getTodos', currentDate],
        previousTodoList.filter((t) => t.id !== todo.id),
      )
      return { previousTodoList }
    },
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
    [styles.shouldFadeIn]: !isDragging,
    [styles.isCompleted]: shouldAnimateCompleted,
    [styles.isDeleted]: shouldAnimateDeleted,
    [styles.isUrgent]:
      !isDragging &&
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

  drag(drop(ref))

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        opacity: isDragging ? 0 : 1,
      }}
      className={containerClassNames}
    >
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

export const TodoItem = memo(UnmemoizedTodoItem)
