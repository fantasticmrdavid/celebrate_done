import React, { useState } from 'react'
import { Form, Input, Modal, Space } from 'antd'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EditOutlined, FolderAddOutlined } from '@ant-design/icons'
import {
  CategoryValidation,
  validateCategory,
} from '@/app/components/CategoryFormModal/utils'
import { ValidationMessage } from '@/app/components/ValidationMessage/ValidationMessage'
import { Category } from '@prisma/client'
import { toast } from 'react-toastify'
import styles from './categoryFormModal.module.scss'

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
      } as Category),
    onSuccess: () => {
      queryClient.invalidateQueries(['getCategories'])
      toast.success(
        <>
          Category <strong>{name}</strong> added!
        </>,
        {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'colored',
        },
      )
      setName('')
      setDescription('')
      if (onCancel) onCancel()
    },
    onError: () => {
      console.log('ERROR')
      toast.error(<>Error creating category. Check console for details.</>, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'colored',
      })
    },
  })

  const saveCategory = useMutation({
    mutationFn: () =>
      axios.patch('/api/categories', {
        action: 'update',
        id: (category as Category).id,
        name,
        description,
        color,
        sortOrder: (category as Category).sortOrder,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries(['getCategories'])
      toast.success(
        <>
          <strong>{name}</strong> updated!
        </>,
        {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'colored',
        },
      )
      if (onCancel) onCancel()
    },
    onError: (error) => {
      console.log('ERROR: ', error)
      toast.error(<>Error saving category. Check console for details.</>, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'colored',
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
        <Form.Item label={'Name'} className={styles.formItem}>
          <Input
            value={name}
            placeholder={'Enter the name for the category'}
            onChange={(e) => setName(e.target.value)}
          />
          {validation.name && <ValidationMessage message={validation.name} />}
        </Form.Item>
        <Form.Item label={'Description'} className={styles.formItem}>
          <Input
            value={description}
            placeholder={'Enter a description for the category'}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item label={'Colour'} className={styles.formItem}>
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
