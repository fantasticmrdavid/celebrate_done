import React, { useState } from 'react'
import { Button, DatePicker, Form, Input, Radio, Select } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import { Category } from '@/app/components/Category/types'
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { New_Todo, TODO_SIZE } from '@/app/components/Todo/types'

const { Option } = Select

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

export const AddTodoForm = () => {
  const [name, setName] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [size, setSize] = useState<TODO_SIZE>(TODO_SIZE.SMALL)
  const [category, setCategory] = useState<Category | undefined>()

  const queryClient = useQueryClient()

  const {
    isLoading: isFetchingCategories,
    error: categoriesError,
    data: categoriesData,
  } = useQuery(
    ['getCategories'] as unknown as QueryKey,
    async () => await fetch('/api/categories').then((res) => res.json())
  )

  const saveTodo = useMutation({
    mutationFn: () =>
      axios.post('/api/todos', {
        name,
        startDate,
        size,
        category,
      } as New_Todo),
    onSuccess: () => {
      queryClient.invalidateQueries(['getTodos'])
      setName('')
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
  }))

  return (
    <div>
      <Form.Item label={'Name'}>
        <Input
          placeholder={'Enter the name for the to-do'}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Item>
      <Form.Item label={'Size'}>
        <Radio.Group
          options={sizeList}
          buttonStyle={'solid'}
          optionType={'button'}
          onChange={(e) => setSize(e.target.value)}
        />
      </Form.Item>
      <Form.Item label={'Category'}>
        <Select
          onChange={(value) =>
            setCategory(categoriesList.find((c) => c.id === value))
          }
          placeholder={'Select a category for the to-do'}
          allowClear
        >
          {categoriesList.map((c) => (
            <Option key={`category_${c.id}`} value={c.id}>
              {c.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label={'Start Date'}>
        <DatePicker
          value={dayjs(startDate)}
          onChange={(_, dateString) => setStartDate(dateString)}
        />
      </Form.Item>
      <Form.Item>
        <Button
          type={'primary'}
          loading={saveTodo.isLoading}
          disabled={saveTodo.isLoading}
          onClick={() => saveTodo.mutate()}
        >
          Add To-do
        </Button>
      </Form.Item>
    </div>
  )
}

export default AddTodoForm
