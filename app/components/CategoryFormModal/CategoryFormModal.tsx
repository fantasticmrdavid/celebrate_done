import React, { useState } from 'react'
import { Form, Input, Modal, notification, Space } from 'antd'
import axios from 'axios'
import { Category } from '@/app/components/Category/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type CategoryFormModalProps = {
  isOpen: boolean
  onCancel?: () => any
}

export const CategoryFormModal = ({
  isOpen,
  onCancel,
}: CategoryFormModalProps) => {
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

  return (
    <Modal
      title={'Add Category'}
      open={isOpen}
      onCancel={onCancel}
      onOk={() => saveCategory.mutate()}
      okText={'Add Category'}
      okButtonProps={{
        loading: saveCategory.isLoading,
        disabled: saveCategory.isLoading,
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
