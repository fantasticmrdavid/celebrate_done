import React, { useState } from 'react'
import { Form, Input, Modal, notification, Space } from 'antd'
import axios from 'axios'
import { Category } from './types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EditOutlined, FolderAddOutlined } from '@ant-design/icons'
import {
  CategoryValidation,
  validateCategory,
} from '@/app/components/CategoryFormModal/utils'
import { ValidationMessage } from '@/app/components/ValidationMessage/ValidationMessage'
import { useSession } from 'next-auth/react'

export enum CategoryModal_Mode {
  ADD = 'ADD',
  EDIT = 'EDIT',
}

type CategoryFormModalProps = {
  isOpen: boolean
  onCancel?: () => void
  mode: CategoryModal_Mode
  category?: Category
}

export const CategoryFormModal = ({
  isOpen,
  onCancel,
  mode,
  category,
}: CategoryFormModalProps) => {
  const { data: session } = useSession()
  const [name, setName] = useState<string>(category ? category.name : '')
  const [description, setDescription] = useState<string>(
    category ? category.description : '',
  )
  const [color, setColor] = useState<string>(
    category?.color ? category.color : '#d9d9d9',
  )
  const [validation, setValidation] = useState<CategoryValidation>({})

  const queryClient = useQueryClient()

  const createCategory = useMutation({
    mutationFn: () =>
      axios.post('/api/categories', {
        name,
        description,
        color,
        userId: session?.user?.id,
      } as Category),
    onSuccess: () => {
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
      if (onCancel) onCancel()
    },
    onError: () => {
      console.log('ERROR')
      notification.error({
        message: <>Error creating category. Check console for details.</>,
      })
    },
  })

  const saveCategory = useMutation({
    mutationFn: () =>
      axios.patch('/api/categories', {
        id: (category as Category).id,
        name,
        description,
        color,
        sortOrder: (category as Category).sortOrder,
      } as Category),
    onSuccess: () => {
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
    onError: (error) => {
      console.log('ERROR: ', error)
      notification.error({
        message: <>Error saving category. Check console for details.</>,
      })
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
      onOk={() => {
        const validation = validateCategory({
          name,
        })
        if (Object.keys(validation).length > 0) return setValidation(validation)
        return mode === CategoryModal_Mode.ADD
          ? createCategory.mutate()
          : saveCategory.mutate()
      }}
      okText={mode === CategoryModal_Mode.ADD ? 'Add Category' : 'Save'}
      okButtonProps={{
        loading: isLoading,
        disabled: isLoading,
      }}
    >
      <Space style={{ padding: '1em', width: '100%' }} direction={'vertical'}>
        <Form.Item label={'Name'}>
          <Input
            value={name}
            placeholder={'Enter the name for the category'}
            onChange={(e) => setName(e.target.value)}
          />
          {validation.name && <ValidationMessage message={validation.name} />}
        </Form.Item>
        <Form.Item label={'Description'}>
          <Input
            value={description}
            placeholder={'Enter a description for the category'}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item label={'Colour'}>
          <Input
            type={'color'}
            value={color}
            placeholder={'Select a colour for the category'}
            onChange={(e) => setColor(e.target.value)}
          />
        </Form.Item>
      </Space>
    </Modal>
  )
}

export default CategoryFormModal
