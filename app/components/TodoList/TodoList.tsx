import React, {useState} from 'react'
import {QueryKey, useMutation, useQuery, useQueryClient,} from '@tanstack/react-query'
import {Todo, TODO_PRIORITY, TODO_STATUS} from '@/app/components/TodoItem/types'
import {Button, Collapse, DatePicker, notification, Space, Typography,} from 'antd'
import axios from 'axios'
import ConfettiExplosion from 'react-confetti-explosion'
import TodoFormModal, {TodoModal_Mode,} from '@/app/components/TodoFormModal/TodoFormModal'
import dayjs from 'dayjs'
import {TodoItem} from '@/app/components/TodoItem/Todo'
import CategoryFormModal, {CategoryModal_Mode,} from '@/app/components/CategoryFormModal/CategoryFormModal'
import {Category} from '@/app/components/Category/types'
import {EditOutlined} from '@ant-design/icons'

type Update_Todo_Complete_Params = {
  action: string
  id: number
  status: TODO_STATUS
  completedDateTime: string | undefined
}

const { Panel } = Collapse
const { Title } = Typography

export const TodoList = () => {
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString()
  )
  const [isExploding, setIsExploding] = useState<boolean>(false)
  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)
  const [todoModalMode, setTodoModalMode] = useState<TodoModal_Mode>(
    TodoModal_Mode.ADD
  )
  const [editTodoTarget, setEditTodoTarget] = useState<Todo | undefined>()
  const [todoModalCategory, setTodoModalCategory] = useState<
    Category | undefined
  >()

  const isToday = new Date(currentDate).getDate() === new Date().getDate()

  const {
    isLoading,
    error,
    data: todoList,
    refetch: refetchTodoList,
  } = useQuery<Todo[]>(
    ['getTodos', currentDate] as unknown as QueryKey,
    async () =>
      await fetch(`/api/todos${!isToday ? `?date=${currentDate}` : ''}`).then(
        (res) => res.json()
      ),
    {
      initialData: [],
    }
  )

  const queryClient = useQueryClient()

  const updateTodo = useMutation({
    mutationFn: (req: Update_Todo_Complete_Params) =>
      axios.patch('/api/todos', {
        action: req.action,
        id: req.id,
        status: req.status,
        completedDateTime: req.completedDateTime,
      }),
    onMutate: async (updateTodoParams) => {
      await queryClient.cancelQueries({ queryKey: ['getTodos'] })
      const previousTodos = queryClient.getQueryData(['getTodos'])
      queryClient.setQueryData(
        ['getTodos'],
        (oldTodoList: Todo[] | undefined) =>
          (oldTodoList || []).map((t) => {
            if (updateTodoParams.id === t.id) {
              return {
                ...t,
                ...updateTodoParams,
              }
            }

            return t
          })
      )
      const isDone = updateTodoParams.status === TODO_STATUS.DONE
      if (isDone) setIsExploding(true)
      setTimeout(() => {
        setIsExploding(false)
      }, 3000)
      return { previousTodos }
    },
    onSuccess: () => {
      refetchTodoList()
    },
    onError: (e, updateTodoParams, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos || [])
      console.error('ERROR: ', e)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    },
  })

  const deleteTodo = useMutation({
    mutationFn: (req: { id: number }) => axios.delete(`/api/todos/${req.id}`),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['getTodos'] })
      const previousTodos = queryClient.getQueryData(['getTodos'])
      queryClient.setQueryData(
        ['getTodos'],
        (oldTodoList: Todo[] | undefined) =>
          (oldTodoList || []).filter((t) => t.id !== id)
      )
      return { previousTodos }
    },
    onSuccess: () => {
      notification.success({
        message: 'Task deleted.',
      })
      refetchTodoList()
    },
    onError: (e, updateTodoParams, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos || [])
      console.error('ERROR: ', e)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    },
  })

  if (isLoading) return <div>LOADING TODOS...</div>

  if (error) return <div>ERROR FETCHING TODOS...</div>

  const handleOnChange = (t: Todo) => {
    const shouldMarkCompleted = t.status !== TODO_STATUS.DONE
    updateTodo.mutate({
      action: 'complete',
      id: t.id,
      status: shouldMarkCompleted ? TODO_STATUS.DONE : TODO_STATUS.INCOMPLETE,
      completedDateTime: shouldMarkCompleted
        ? new Date().toISOString()
        : undefined,
    })
  }

  const categoryList: Category[] = todoList.reduce(
    (acc: Category[], currTodo: Todo) => {
      if (!acc.find((c) => c.id === currTodo.category.id)) {
        return [...acc, currTodo.category]
      }
      return acc
    },
    []
  )

  return (
    <>
      <Space
        style={{ display: 'flex', columnGap: '1em', paddingBottom: '1em' }}
      >
        <Title style={{ margin: 0 }}>
          {isToday
            ? 'Today'
            : dayjs(new Date(currentDate)).format('ddd, MMM D, YYYY')}
        </Title>
        <DatePicker
          value={dayjs(new Date(currentDate))}
          allowClear={false}
          onChange={(_, dateString) => {
            setCurrentDate(dateString)
            refetchTodoList()
          }}
        />
      </Space>
      <Space
        size={'small'}
        align={'start'}
        style={{ display: 'flex', flexWrap: 'wrap' }}
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
            <ConfettiExplosion
              force={0.8}
              duration={3000}
              particleCount={250}
              width={1600}
            />
          )}
        </Space>
        {categoryList.map((c) => (
          <Collapse
            key={`category_${c.id}`}
            collapsible="icon"
            expandIconPosition={'end'}
            defaultActiveKey={c.id}
          >
            <Panel
              key={c.id}
              header={
                <Space direction={'vertical'} style={{ width: '100%' }}>
                  <Title
                    level={5}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: 0,
                    }}
                  >
                    <div>{c.name}</div>
                    <div style={{ marginLeft: '1em' }}>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          setTodoModalCategory(c)
                          setIsCategoryModalOpen(true)
                        }}
                      />
                      <Button
                        onClick={() => {
                          setTodoModalCategory(c)
                          setTodoModalMode(TodoModal_Mode.ADD)
                          setIsTodoModalOpen(true)
                        }}
                      >
                        + Task
                      </Button>
                    </div>
                  </Title>
                  <Space style={{ marginBottom: '0.75em', fontSize: '0.8rem' }}>
                    {c.description}
                  </Space>
                </Space>
              }
            >
              {todoList
                .filter((t: Todo) => t.category.id === c.id)
                .sort((a: Todo, b: Todo) => {
                  if (a.status !== TODO_STATUS.DONE && a.priority === TODO_PRIORITY.URGENT) return -1
                  if (b.status !== TODO_STATUS.DONE && b.priority === TODO_PRIORITY.URGENT) return 1
                  return a.status === TODO_STATUS.DONE ? 1 : -1
                })
                .map((t: Todo) => (
                  <TodoItem
                    key={`todo_${t.id}`}
                    todo={t}
                    onChange={() => handleOnChange(t)}
                    onEdit={() => {
                      setEditTodoTarget(t)
                      setTodoModalMode(TodoModal_Mode.EDIT)
                      setIsTodoModalOpen(true)
                    }}
                    onDelete={() => deleteTodo.mutate({ id: t.id })}
                  />
                ))}
            </Panel>
          </Collapse>
        ))}
        {isTodoModalOpen && (
          <TodoFormModal
            isOpen={true}
            onCancel={() => {
              setIsTodoModalOpen(false)
              if (todoModalMode === TodoModal_Mode.EDIT)
                setEditTodoTarget(undefined)
            }}
            category={todoModalCategory}
            mode={todoModalMode}
            todo={
              todoModalMode === TodoModal_Mode.EDIT ? editTodoTarget : undefined
            }
          />
        )}
        {isCategoryModalOpen && (
          <CategoryFormModal
            isOpen={isCategoryModalOpen}
            onCancel={() => {
              setIsCategoryModalOpen(false)
              setTodoModalCategory(undefined)
            }}
            mode={CategoryModal_Mode.EDIT}
            category={todoModalCategory}
          />
        )}
      </Space>
    </>
  )
}
