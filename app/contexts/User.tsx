import React, { createContext, ReactNode, FC } from 'react'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'

export type User = {
  uuid: string
  username: string
  email: string
  firstname: string
  surname: string
}

export interface UserContextValues {
  user: User
  isFetchingUser: boolean
  isFetchingUserError: boolean
}

interface UserContextProps {
  uuid: string
  children: ReactNode
}

const UserContextInitialValues = {
  user: {
    uuid: '',
    email: '',
    username: '',
    firstname: '',
    surname: '',
  },
  isFetchingUser: false,
  isFetchingUserError: false,
}

export const UserContext = createContext<UserContextValues>(
  UserContextInitialValues
)

export const UserProvider: FC<UserContextProps> = ({ uuid, children }) => {
  const {
    isLoading,
    error,
    data: user,
  } = useQuery(
    ['getUser'] as unknown as QueryKey,
    async () => await fetch(`/api/users/${uuid}`).then((res) => res.json())
  )

  if (isLoading)
    return (
      <Spin tip="Loading users..." size="large">
        <div className="content" />
      </Spin>
    )

  return (
    <UserContext.Provider
      value={{
        user,
        isFetchingUser: isLoading,
        isFetchingUserError: !!error,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}