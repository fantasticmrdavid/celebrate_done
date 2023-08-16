import {
  Checkbox,
  Dropdown,
  MenuProps,
  Modal,
  notification,
  Space,
  Tag,
  Tooltip,
} from 'antd'
import classNames from 'classnames'
import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import {
  TODO_PRIORITY,
  TODO_SIZE,
  TODO_STATUS,
} from '@/app/components/TodoItem/utils'
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
import { useDrag, useDrop, XYCoord } from 'react-dnd'
import { DRAGGABLE_TYPE } from '@/app/constants/constants'
import { Identifier } from 'dnd-core'
import { v4 as uuidv4 } from 'uuid'
import { BsRepeat } from 'react-icons/bs'
import { SelectedDateContext } from '@/app/contexts/SelectedDate'
import { useSession } from 'next-auth/react'
import { TodoWithRelationsNoCategory } from '@/pages/api/todos/getTodos'
import { CategoryWithRelations } from '@/pages/api/categories/getCategories'
import ConfettiExplosion from 'react-confetti-explosion'
import { Schedule, Todo } from '@prisma/client'

type TodoProps = {
  todo: TodoWithRelationsNoCategory
  schedule: Schedule | null
  index: number
  category: CategoryWithRelations
  onDrag: (dragIndex: number, hoverIndex: number) => void
  onSort?: () => void
  onAddProgress?: (t: Todo) => Promise<{ previousTodoList: unknown }>
}

type Update_Todo_Params = {
  action: string
  id: string
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
  const { todo, category, schedule, index, onDrag, onSort, onAddProgress } =
    props
  const ref = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { currentDate } = useContext(SelectedDateContext)
  const [modal, modalContextHolder] = Modal.useModal()
  const [shouldAnimateCompleted, setShouldAnimateCompleted] =
    useState<boolean>(false)
  const [shouldAnimateDeleted, setShouldAnimateDeleted] =
    useState<boolean>(false)
  const [shouldAnimateFadeOut, setShouldAnimateFadeOut] =
    useState<boolean>(false)
  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)
  const [isExploding, setIsExploding] = useState<boolean>(false)

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
      if (action === 'complete') {
        await queryClient.cancelQueries(['getCategories', currentDate])

        const previousCategoriesList = queryClient.getQueryData([
          'getCategories',
          currentDate,
        ]) as CategoryWithRelations[]

        const updatedCategoriesList = previousCategoriesList.map((c) =>
          c.id === category.id
            ? {
                ...c,
                todos: c.todos.map((t) =>
                  t.id === todo.id
                    ? {
                        ...t,
                        status: status || TODO_STATUS.INCOMPLETE,
                      }
                    : t,
                ),
              }
            : c,
        )

        queryClient.setQueryData(
          ['getCategories', currentDate],
          updatedCategoriesList,
        )

        if (status === TODO_STATUS.DONE) {
          setIsExploding(true)
          setTimeout(() => {
            setIsExploding(false)
          }, 3000)
        }
        return { previousCategoriesList }
      }
    },
    onError: (e) => {
      console.error('ERROR: ', e)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['getCategories', currentDate],
      })
      queryClient.invalidateQueries(['generateScheduledTodos'])
    },
  })

  const addTodoProgress = useMutation({
    mutationFn: () =>
      axios.post('/api/todos/progress', {
        name: todo.name,
        category: category,
        userId: session?.user?.id,
      }),
    onMutate: async () => {
      if (onAddProgress) {
        onAddProgress({
          id: uuidv4(),
          userId: todo.userId,
          categoryId: category.id,
          scheduleId: null,
          created: new Date(),
          startDate: new Date(),
          completedDateTime: new Date(),
          name: `Chipped away at ${todo.name.trim()}`,
          notes: `I made progress on ${todo.name.trim()} today`,
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
        queryKey: ['getCategories', currentDate],
      })
    },
  })

  const deleteTodo = useMutation({
    mutationFn: () => axios.delete(`/api/todos/${todo.id}`),
    onMutate: async () => {
      await queryClient.cancelQueries(['getCategories', currentDate])
      const previousCategoriesList: CategoryWithRelations[] =
        queryClient.getQueryData(['getCategories', currentDate]) || []
      queryClient.setQueryData(
        ['getCategories', currentDate],
        previousCategoriesList.map((c) =>
          c.id === category.id
            ? {
                ...c,
                todos: c.todos.filter((t) => t.id !== todo.id),
              }
            : c,
        ),
      )
      return { previousCategoriesList }
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
      queryClient.invalidateQueries({ queryKey: ['getCategories'] })
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
      priority:
        todo.priority == TODO_PRIORITY.URGENT
          ? TODO_PRIORITY.NORMAL
          : TODO_PRIORITY.URGENT,
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
            modal.confirm({
              title: 'Delete task',
              content: (
                <>
                  Are you sure you want to delete <strong>{todo.name}</strong>?
                </>
              ),
              okText: 'Delete',
              onOk: () => {
                setShouldAnimateFadeOut(true)
                setShouldAnimateDeleted(true)
                deleteTodo.mutate()
              },
            })
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
    <div className={styles.todoContent}>
      {todo.name}{' '}
      <div className={styles.indicatorList}>
        <Tag color={sizeTags[todo.size].color}>{sizeTags[todo.size].label}</Tag>
        {todo.notes && (
          <Tooltip title={todo.notes}>
            <FileTextOutlined />
          </Tooltip>
        )}
        {schedule && (
          <Tooltip title={`Repeats ${schedule.unit?.toLowerCase()}`}>
            <BsRepeat />
          </Tooltip>
        )}
      </div>
    </div>
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
          disabled={todo.id === 'temp_newID'}
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
          {todo.id === 'temp_newID' || updateTodo.isLoading ? (
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
          category={category}
          todo={todo}
          schedule={schedule}
        />
      )}
      {modalContextHolder}
      <Space
        style={{
          position: 'absolute',
          width: '100%',
          top: '10%',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {isExploding && (
          <ConfettiExplosion duration={3000} particleCount={100} width={1600} />
        )}
      </Space>
    </div>
  )
}

export const TodoItem = memo(UnmemoizedTodoItem)
