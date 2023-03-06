import React, { useState } from 'react'
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Todo, TODO_STATUS } from '@/app/components/TodoItem/types'
import { Button, Card, DatePicker, Space, Typography } from 'antd'
import axios from 'axios'
import ConfettiExplosion from 'react-confetti-explosion'
import AddTodoFormModal from '@/app/components/AddTodoFormModal/AddTodoFormModal'
import dayjs from 'dayjs'
import { TodoItem } from '@/app/components/TodoItem/Todo'

type Update_Todo_Complete_Params = {
  action: string
  id: number
  status: TODO_STATUS
  completedDateTime: string | undefined
}

type Todo_Category = {
  id: number
  name: string
  description: string
}

const { Title } = Typography

export const TodoList = () => {
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString()
  )
  const [isExploding, setIsExploding] = useState<boolean>(false)
  const [isAddTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)
  const [todoModalCategory, setTodoModalCategory] = useState<
    Todo_Category | undefined
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
    onSuccess: (res) => {
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

  const categoryList: Todo_Category[] = todoList.reduce(
    (acc: Todo_Category[], currTodo: Todo) => {
      if (!acc.find((c) => c.id === currTodo.category_id)) {
        return [
          ...acc,
          {
            id: currTodo.category_id,
            name: currTodo.category_name,
            description: currTodo.category_description,
          },
        ]
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
          <Card
            key={`category_${c.id}`}
            title={c.name}
            size={'small'}
            extra={
              <Button
                onClick={() => {
                  setTodoModalCategory(c)
                  setIsTodoModalOpen(true)
                }}
              >
                + Task
              </Button>
            }
          >
            <Space style={{ marginBottom: '0.75em', fontSize: '0.8rem' }}>
              {c.description}
            </Space>
            <div>
              {todoList
                .filter((t: Todo) => t.category_id === c.id)
                .sort((a: Todo) => (a.status === TODO_STATUS.DONE ? 1 : -1))
                .map((t: Todo) => (
                  <TodoItem
                    key={`todo_${t.id}`}
                    todo={t}
                    onChange={() => handleOnChange(t)}
                  />
                ))}
            </div>
          </Card>
        ))}
        {isAddTodoModalOpen && (
          <AddTodoFormModal
            isOpen={true}
            onCancel={() => setIsTodoModalOpen(false)}
            category={todoModalCategory}
          />
        )}
      </Space>
    </>
  )
}
