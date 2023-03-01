import React, { useState } from 'react'
import { Button, DatePicker, Form, Input, Radio, Select } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import { Category } from '@/app/components/Category/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const { Option } = Select

export const CategoryForm = () => {
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [maxPerDay, setMaxPerDay] = useState<number | undefined>()

  const queryClient = useQueryClient()

  const saveCategory = useMutation({
    mutationFn: () =>
      axios.post('/api/categories', {
        name,
        description,
        maxPerDay,
      } as Category),
    onSuccess: () => {
      queryClient.invalidateQueries(['getCategories'])
      setName('')
    },
    onError: () => {
      console.log('ERROR')
    },
  })

  return (
    <div>
      <Form.Item label={'Name'}>
        <Input
          placeholder={'Enter the name for the category'}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Item>
      <Form.Item label={'Description'}>
        <Input
          placeholder={'Enter a description for the category'}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Item>
      <Form.Item label={'Max items per day (optional)'}>
        <Input
          type={'number'}
          placeholder={
            'Enter the maximum number of items this category is allowed to have per day'
          }
          onChange={(e) => setMaxPerDay(parseInt(e.target.value))}
        />
      </Form.Item>
      <Form.Item>
        <Button
          type={'primary'}
          loading={saveCategory.isLoading}
          disabled={saveCategory.isLoading}
          onClick={() => saveCategory.mutate()}
        >
          Add Category
        </Button>
      </Form.Item>
    </div>
  )
}

export default CategoryForm
