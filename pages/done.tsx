import React, { useState } from 'react'
import { Space, Spin } from 'antd'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Todo } from '@/app/components/TodoItem/types'
import { DoneCount } from '@/app/components/DoneCount/DoneCount'

export const DonePage = () => {
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString()
  )
  const isToday = new Date(currentDate).getDate() === new Date().getDate()
  const {
    isLoading,
    error,
    data: todoList,
  } = useQuery<Todo[]>(
    ['getTodos', currentDate] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos/done${!isToday ? `?date=${currentDate}` : ''}`
      ).then((res) => res.json()),
    {
      initialData: [],
    }
  )

  if (isLoading)
    return (
      <Spin tip="Loading..." size="large">
        <div className="content" />
      </Spin>
    )

  if (error) return <div>ERROR FETCHING TODOS...</div>

  return (
    <Space direction={'vertical'} size={'middle'}>
      <DoneCount count={todoList.length} />
      <ul>
        {todoList.map((t) => (
          <li key={`todo_${t.id}`}>{t.name}</li>
        ))}
      </ul>
    </Space>
  )
}

export default DonePage
