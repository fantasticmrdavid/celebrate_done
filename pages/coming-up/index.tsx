import React, { useContext, useRef, useState } from 'react'
import { Radio, Skeleton, Space, Tag } from 'antd'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Todo } from '@/app/components/TodoItem/types'
import { sizeTags } from '@/app/components/TodoItem/Todo'

import { Fireworks } from '@fireworks-js/react'
import type { FireworksHandlers } from '@fireworks-js/react'

import styles from './comingUpPage.module.scss'
import {
  getLocalEndOfDay,
  getLocalEndOfMonth,
  getLocalEndOfWeek,
  getLocalEndOfYear,
} from '@/app/utils'
import { dateIsoToSql } from '@/pages/api/utils'
import { Quote } from '@/app/components/Quote/Quote'
import quoteList from '@/app/data/quotes'
import { CategoriesContext } from '@/app/contexts/Categories'
import dayjs from 'dayjs'
import { useSession } from 'next-auth/react'

export enum DateRangeType {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

const titleStrings = {
  [DateRangeType.WEEK]: 'This Week',
  [DateRangeType.MONTH]: 'This Month',
  [DateRangeType.YEAR]: 'This Year',
}

export const ComingUpPage = () => {
  const today = new Date()
  const { data: session } = useSession()
  const { categoryList } = useContext(CategoriesContext)
  const [currentDate] = useState<string>(today.toISOString().slice(0, 10))
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>(
    DateRangeType.WEEK,
  )

  const quote = quoteList[(quoteList.length * Math.random()) | 0]

  const getDateRangeQuery = () => {
    if (dateRangeType === DateRangeType.WEEK) {
      return `dateRangeStart=${dateIsoToSql(getLocalEndOfDay(currentDate))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfWeek(currentDate))}`
    }
    if (dateRangeType === DateRangeType.MONTH) {
      return `dateRangeStart=${dateIsoToSql(getLocalEndOfDay(currentDate))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfMonth(currentDate))}`
    }
    if (dateRangeType === DateRangeType.YEAR) {
      return `dateRangeStart=${dateIsoToSql(getLocalEndOfDay(currentDate))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfYear(currentDate))}`
    }
  }

  const {
    isLoading,
    error,
    data: todoList,
  } = useQuery<Todo[]>(
    ['getFutureTodos', currentDate, dateRangeType] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos/future?user_id=${session?.user?.id}&${getDateRangeQuery()}`,
      ).then((res) => res.json()),
  )
  const ref = useRef<FireworksHandlers>(null)

  const isReady = !isLoading && todoList

  if (error) return <div>ERROR FETCHING TODOS...</div>

  return (
    <Space direction={'vertical'} align={'center'} style={{ width: '100%' }}>
      <div style={{ padding: '1em 0' }}>
        <Radio.Group
          size={'small'}
          value={dateRangeType}
          buttonStyle="solid"
          onChange={(e) => setDateRangeType(e.target.value)}
          disabled={!isReady}
        >
          <Radio.Button value={DateRangeType.WEEK}>This Week</Radio.Button>
          <Radio.Button value={DateRangeType.MONTH}>This Month</Radio.Button>
          <Radio.Button value={DateRangeType.YEAR}>This Year</Radio.Button>
        </Radio.Group>
      </div>
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
          <div>
            <h1>
              Coming up {titleStrings[dateRangeType].toLocaleLowerCase()}:
            </h1>
            <div>
              {quote && (
                <Space align={'center'} className={styles.quoteWrapper}>
                  <Quote author={quote.author} content={quote.quote} />
                </Space>
              )}
            </div>
            {!isReady && (
              <>
                <Skeleton active />
              </>
            )}
            {isReady &&
              categoryList.map((c) => {
                const categoryTodoList = todoList.filter(
                  (t) => t.category.name === c.name,
                )
                return categoryTodoList.length > 0 ? (
                  <div key={`category_${c.name}`}>
                    <h4 style={{ fontWeight: 700 }}>{c.name}</h4>
                    <ul
                      style={{
                        fontSize: '1rem',
                        lineHeight: 1.25,
                        padding: 0,
                        listStylePosition: 'inside',
                      }}
                    >
                      {categoryTodoList.map((t) => (
                        <li key={`todo_${t.uuid}`} className={styles.doneItem}>
                          <>
                            {dayjs(t.startDate).format('MMM DD')} - {t.name}
                            <Tag
                              color={sizeTags[t.size].color}
                              style={{ marginLeft: '0.5em' }}
                            >
                              {sizeTags[t.size].label}
                            </Tag>
                          </>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              })}
          </div>
        </div>
      </Space>
    </Space>
  )
}

export default ComingUpPage
