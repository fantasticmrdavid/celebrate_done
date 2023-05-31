import React from 'react'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Select, Space, Spin } from 'antd'
import { User } from '@/app/contexts/User'

type Props = {
  onSelect: (uuid: string) => void
}

export const UserSelector = ({ onSelect }: Props) => {
  const {
    isLoading,
    error,
    data: users,
  } = useQuery(
    ['getUserList'] as unknown as QueryKey,
    async () => await fetch(`/api/users`).then((res) => res.json())
  )

  if (isLoading)
    return (
      <div className={'container'}>
        <Spin tip="Loading users" size="large" />
      </div>
    )
  if (error) return <div className={'container'}>ERROR LOADING USERS...</div>

  return (
    <Space direction={'vertical'}>
      <h2>celebrate.DONE 🎉</h2>
      <Select
        style={{ minWidth: '250px' }}
        placeholder={'Select user'}
        onChange={(val) => onSelect(val)}
        options={users.map((u: User) => ({
          label: u.username,
          value: u.uuid,
        }))}
      />
    </Space>
  )
}
