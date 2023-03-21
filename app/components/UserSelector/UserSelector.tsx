import React from 'react'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Select } from 'antd'
import { User } from '@/app/contexts/User'
import styles from '@/app/components/HeaderNav/headerNav.module.scss'

type Props = {
  onSelect: (uuid: string) => any
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

  if (isLoading) return <div>LOADING USERS...</div>
  if (error) return <div>ERROR LOADING USERS...</div>

  return (
    <>
      <h2>celebrate.DONE</h2>
      <Select
        placeholder={'Select user'}
        onChange={(val) => onSelect(val)}
        options={users.map((u: User) => ({
          label: u.username,
          value: u.uuid,
        }))}
      />
    </>
  )
}
