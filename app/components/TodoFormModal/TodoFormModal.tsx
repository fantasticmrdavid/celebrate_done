import React, { useState } from 'react'
import {
  DatePicker,
  Form,
  Input,
  Modal,
  notification,
  Radio,
  Select,
  Space,
} from 'antd'
import axios from 'axios'
import { Category } from '@/app/components/Category/types'
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import dayjs from 'dayjs'
import {New_Todo, Todo, TODO_SIZE} from '@/app/components/TodoItem/types'
import {Todo_Category} from "@/app/components/TodoList/TodoList";

type TodoFormModalProps = {
  isOpen: boolean
  onCancel?: () => any
  category?: Todo_Category
  mode: TodoModal_Mode
  todo?: Todo
}

export enum TodoModal_Mode {
  ADD = "ADD",
  EDIT = "EDIT"
}

const sizeList = [
  {
    label: 'Small',
    value: TODO_SIZE.SMALL,
  },
  {
    label: 'Medium',
    value: TODO_SIZE.MEDIUM,
  },
  {
    label: 'Large',
    value: TODO_SIZE.LARGE,
  },
]

const { Option } = Select

export const TodoFormFormModal = (props: TodoFormModalProps) => {
  const { isOpen, onCancel, category: propsCategory, todo, mode } = props
  const [name, setName] = useState<string>(todo ? todo.name : '')
  const [startDate, setStartDate] = useState<string>(
    new Date(todo ? todo.startDate : '').toISOString().split('T')[0]
  )
  const [size, setSize] = useState<TODO_SIZE>(todo ? todo.size : TODO_SIZE.SMALL)
  const [category, setCategory] = useState<Todo_Category | undefined>(todo ? {
    id: todo.category_id,
    name: todo.category_name,
    description: todo.category_description,
  } : propsCategory)

  const queryClient = useQueryClient()

  const {
    isLoading: isFetchingCategories,
    error: categoriesError,
    data: categoriesData,
  } = useQuery(
    ['getCategories'] as unknown as QueryKey,
    async () => await fetch('/api/categories').then((res) => res.json())
  )

  const createTodo = useMutation({
    mutationFn: () =>
      axios.post('/api/todos', {
        name,
        startDate,
        size,
        category,
      } as New_Todo),
    onSuccess: () => {
      queryClient.invalidateQueries(['getTodos'])
      notification.success({
        message: (
          <>
            <strong>{name}</strong> added to <strong>{category?.name}</strong>!
          </>
        ),
      })
      setName('')
      if (onCancel) onCancel()
    },
    onError: () => {
      console.log('ERROR')
    },
  })

  const saveTodo = useMutation({
    mutationFn: () =>
      axios.patch('/api/todos', {
        id: (todo as Todo).id,
        name,
        startDate,
        size,
        category,
        action: 'update',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['getTodos'])
      notification.success({
        message: (
          <>
            <strong>{name}</strong> updated!
          </>
        ),
      })
      if (onCancel) onCancel()
    },
    onError: () => {
      console.log('ERROR')
    },
  })

  if (isFetchingCategories) return <div>LOADING CATEGORIES...</div>

  if (categoriesError) return <div>ERROR LOADING CATEGORIES...</div>

  const categoriesList: Category[] = categoriesData.map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    maxPerDay: c.maxPerDay,
    sortOrder: c.sortOrder
  }))

  return (
    <Modal
      title={mode === TodoModal_Mode.ADD  ? 'Add Task' : 'Edit Task'}
      open={isOpen}
      onCancel={onCancel}
      onOk={() => mode === TodoModal_Mode.ADD ? createTodo.mutate() : saveTodo.mutate()}
      okText={mode === TodoModal_Mode.ADD ? 'Add Task' : 'Save'}
      okButtonProps={{
        loading: createTodo.isLoading,
        disabled: createTodo.isLoading,
      }}
    >
      <Space style={{ padding: '1em' }} direction={'vertical'}>
        <Form.Item label={'Name'}>
          <Input
            defaultValue={name}
            placeholder={'Enter the name for the task'}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Item>
        <Form.Item label={'Size'}>
          <Radio.Group
            value={size}
            options={sizeList}
            buttonStyle={'solid'}
            optionType={'button'}
            onChange={(e) => setSize(e.target.value)}
          />
        </Form.Item>
        <Form.Item label={'Category'}>
          <Select
            defaultValue={category?.id}
            onChange={(value) =>
              setCategory(categoriesList.find((c) => c.id === value))
            }
            placeholder={'Select a category for the task'}
            allowClear
          >
            {categoriesList.map((c) => (
              <Option key={`category_${c.id}`} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={'Is visible from'}>
          <DatePicker
            value={dayjs(new Date(startDate))}
            allowClear={false}
            onChange={(_, dateString) => setStartDate(dateString)}
          />
        </Form.Item>
      </Space>
    </Modal>
  )
}

export default TodoFormFormModal
