import React, { useContext, useEffect, useRef, useState } from 'react'
import { Space, Spin, Tag } from 'antd'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Todo, TODO_SIZE } from '@/app/components/TodoItem/types'
import { DoneCount } from '@/app/components/DoneCount/DoneCount'
import { sizeTags } from '@/app/components/TodoItem/Todo'
import { UserContext } from '@/app/contexts/User'

import { Fireworks } from '@fireworks-js/react'
import type { FireworksHandlers } from '@fireworks-js/react'

import styles from './done.module.scss'

export const DonePage = () => {
  const today = new Date()
  const { user, isFetchingUser } = useContext(UserContext)
  const [currentDate, setCurrentDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(today.getDate()).padStart(2, '0')}`
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
      ).then((res) => res.json())
  )
  const ref = useRef<FireworksHandlers>(null)

  if (isLoading || !todoList)
    return (
      <Spin tip="Loading..." size="large">
        <div className="content" />
      </Spin>
    )

  if (error) return <div>ERROR FETCHING TODOS...</div>

  return (
    <Space size={'middle'} className={styles.container}>
      <div className={styles.bg}>
        <Fireworks
          ref={ref}
          options={{ delay: { min: 100, max: 500 } }}
          style={{
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
        />
      </div>
      <div className={styles.content}>
        <DoneCount count={todoList.length} />
        <div>
          <h1>What I did today:</h1>
          <ul
            style={{
              fontSize: '1rem',
              lineHeight: 1.25,
              padding: 0,
              listStylePosition: 'inside',
              listStyle: 'none',
            }}
          >
            {todoList.map((t) => (
              <li key={`todo_${t.id}`} className={styles.doneItem}>
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
      </div>
    </Space>
  )
}

export default DonePage
