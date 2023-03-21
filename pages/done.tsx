import React, { useContext, useState } from 'react'
import { Space, Spin, Tag } from 'antd'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Todo, TODO_SIZE } from '@/app/components/TodoItem/types'
import { DoneCount } from '@/app/components/DoneCount/DoneCount'
import { sizeTags } from '@/app/components/TodoItem/Todo'
import { UserContext } from '@/app/contexts/User'

export const DonePage = () => {
  const { user, isFetchingUser } = useContext(UserContext)
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString()
  )
  const {
    isLoading,
    error,
    data: todoList,
  } = useQuery<Todo[]>(
    ['getDoneTodos', currentDate] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos/done?user_id=${user.uuid}&date=${currentDate}`
      ).then((res) => res.json()),
    {
      initialData: [],
    }
  )

  if (isLoading || isFetchingUser)
    return (
      <Spin tip="Loading..." size="large">
        <div className="content" />
      </Spin>
    )

  if (error) return <div>ERROR FETCHING TODOS...</div>

  return (
    <Space
      size={'middle'}
      style={{ justifyContent: 'center', width: '100%', columnGap: '2em' }}
    >
      <DoneCount count={todoList.length} />
      <div>
        <h1>🎉 What I did today:</h1>
        <ul style={{ fontSize: '1rem', lineHeight: 1.25 }}>
          {todoList.map((t) => (
            <li key={`todo_${t.id}`}>
              {t.name}{' '}
              {t.size !== TODO_SIZE.SMALL && (
                <Tag color={sizeTags[t.size].color}>
                  {sizeTags[t.size].label}
                </Tag>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Space>
  )
}

export default DonePage
