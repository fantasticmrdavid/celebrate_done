import React, { useState } from 'react'
import { Form, Input, Modal, notification, Space } from 'antd'
import axios from 'axios'
import { Category } from './types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EditOutlined, FolderAddOutlined } from '@ant-design/icons'

export enum CategoryModal_Mode {
  ADD = 'ADD',
  EDIT = 'EDIT',
}

type CategoryFormModalProps = {
  isOpen: boolean
  onCancel?: () => any
  mode: CategoryModal_Mode
  category?: Category
}

export const CategoryFormModal = ({
  isOpen,
  onCancel,
  mode,
  category,
}: CategoryFormModalProps) => {
  const [name, setName] = useState<string>(category ? category.name : '')
  const [description, setDescription] = useState<string>(
    category ? category.description : ''
  )
  const [maxPerDay, setMaxPerDay] = useState<number | undefined>(
    category ? category.maxPerDay : undefined
  )

  const queryClient = useQueryClient()

  const createCategory = useMutation({
    mutationFn: () =>
      axios.post('/api/categories', {
        name,
        description,
        maxPerDay,
      } as Category),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['getCategories'])
      notification.success({
        message: (
          <>
            Category <strong>{name}</strong> added!
          </>
        ),
      })
      setName('')
      setDescription('')
      setMaxPerDay(undefined)
      if (onCancel) onCancel()
    },
    onError: () => {
      console.log('ERROR')
    },
  })

  const saveCategory = useMutation({
    mutationFn: () =>
      axios.patch('/api/categories', {
        id: (category as Category).id,
        name,
        description,
        maxPerDay,
        sortOrder: (category as Category).sortOrder,
      } as Category),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['getCategories'])
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

  const isLoading = createCategory.isLoading || saveCategory.isLoading

  return (
    <Modal
      title={
        <>
          {mode === CategoryModal_Mode.ADD ? (
            <>
              <FolderAddOutlined /> Add
            </>
          ) : (
            <>
              <EditOutlined /> Edit
            </>
          )}{' '}
          Category
        </>
      }
      open={isOpen}
      onCancel={onCancel}
      onOk={() =>
        mode === CategoryModal_Mode.ADD
          ? createCategory.mutate()
          : saveCategory.mutate()
      }
      okText={mode === CategoryModal_Mode.ADD ? 'Add CategoryCards' : 'Save'}
      okButtonProps={{
        loading: isLoading,
        disabled: isLoading,
      }}
    >
      <Space style={{ padding: '1em' }} direction={'vertical'}>
        <Form.Item label={'Name'}>
          <Input
            value={name}
            placeholder={'Enter the name for the category'}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Item>
        <Form.Item label={'Description'}>
          <Input
            value={description}
            placeholder={'Enter a description for the category'}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item label={'Max items per day (optional)'}>
          <Input
            value={maxPerDay}
            type={'number'}
            placeholder={
              'Enter the maximum number of items this category is allowed to have per day'
            }
            onChange={(e) => setMaxPerDay(parseInt(e.target.value))}
          />
        </Form.Item>
      </Space>
    </Modal>
  )
}

export default CategoryFormModal
