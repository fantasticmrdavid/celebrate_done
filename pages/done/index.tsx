import React, { useCallback, useRef, useState } from 'react'
import { Radio, Skeleton, Space, Tag } from 'antd'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { DoneCount } from '@/app/components/DoneCount/DoneCount'
import { sizeTags } from '@/app/components/TodoItem/Todo'

import { Fireworks } from '@fireworks-js/react'
import type { FireworksHandlers } from '@fireworks-js/react'

import { Chart } from 'react-google-charts'

import styles from './donePage.module.scss'
import {
  getLocalEndOfDay,
  getLocalEndOfYear,
  getLocalPastNinetyDays,
  getLocalPastSevenDays,
  getLocalStartOfDay,
  getLocalStartOfYear,
} from '@/app/utils'
import { CategoryWithTodoCounts } from '@/pages/api/todos/done'
import { Quote } from '@/app/components/Quote/Quote'
import quoteList from '@/app/data/quotes'
import Image from 'next/image'
import { DoneCountSkeleton } from '@/app/components/DoneCount/DoneCountSkeleton'
import { useSession } from 'next-auth/react'
import { TodoSize } from '@prisma/client'

export enum DateRangeType {
  DAY = 'DAY',
  SEVEN_DAYS = 'SEVEN_DAYS',
  NINETY_DAYS = 'NINETY_DAYS',
  YEAR = 'YEAR',
}

const titleStrings = {
  [DateRangeType.DAY]: 'Today',
  [DateRangeType.SEVEN_DAYS]: 'Last 7 days',
  [DateRangeType.NINETY_DAYS]: 'Last 90 days',
  [DateRangeType.YEAR]: 'This Year',
}

const emptyTodoListGifList = [
  'you_can _do_it_pink_dog_postcard.gif',
  'you_can_do_it_cartoon_lizard.gif',
  'you_can_do_it_cat_dog.gif',
]

export const DonePage = () => {
  const today = new Date()
  const { data: session, status: sessionStatus } = useSession()
  const [currentDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(today.getDate()).padStart(2, '0')}`,
  )
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>(
    DateRangeType.DAY,
  )

  const quote = quoteList[(quoteList.length * Math.random()) | 0]
  const emptyGif =
    emptyTodoListGifList[(emptyTodoListGifList.length * Math.random()) | 0]

  const getDateRangeQuery = () => {
    if (dateRangeType === DateRangeType.DAY) {
      return `dateRangeStart=${getLocalStartOfDay(
        currentDate,
      )}&dateRangeEnd=${getLocalEndOfDay(currentDate)}`
    }
    if (dateRangeType === DateRangeType.SEVEN_DAYS) {
      return `dateRangeStart=${getLocalPastSevenDays(
        currentDate,
      )}&dateRangeEnd=${getLocalEndOfDay(currentDate)}`
    }
    if (dateRangeType === DateRangeType.NINETY_DAYS) {
      return `dateRangeStart=${getLocalPastNinetyDays(
        currentDate,
      )}&dateRangeEnd=${getLocalEndOfDay(currentDate)}`
    }
    if (dateRangeType === DateRangeType.YEAR) {
      return `dateRangeStart=${getLocalStartOfYear(
        currentDate,
      )}&dateRangeEnd=${getLocalEndOfYear(currentDate)}`
    }
  }

  const getCategoryTotalCount = useCallback(
    (c: CategoryWithTodoCounts) =>
      c.todos.reduce((acc, curr) => (acc += curr.count), 0),
    [],
  )

  const {
    isLoading,
    error,
    data: doneCategoriesList,
  } = useQuery<CategoryWithTodoCounts[]>(
    ['getDoneTodos', currentDate, dateRangeType] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos/done?userId=${session?.user?.id}&${getDateRangeQuery()}`,
      ).then((res) => res.json()),
  )
  const ref = useRef<FireworksHandlers>(null)

  if (error) return <div>ERROR FETCHING TODOS...</div>

  const isReady =
    !isLoading && sessionStatus === 'authenticated' && doneCategoriesList

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
          <Radio.Button value={DateRangeType.DAY}>Today</Radio.Button>
          <Radio.Button value={DateRangeType.SEVEN_DAYS}>
            Last 7 Days
          </Radio.Button>
          <Radio.Button value={DateRangeType.NINETY_DAYS}>
            Last 90 days
          </Radio.Button>
          <Radio.Button value={DateRangeType.YEAR}>This Year</Radio.Button>
        </Radio.Group>
      </div>
      <Space size={'middle'} className={styles.container}>
        <div className={styles.content}>
          {!isReady && (
            <>
              <div>
                <DoneCountSkeleton />
                <Skeleton style={{ width: '320px' }} active />
              </div>
              <div>
                <Skeleton paragraph={false} style={{ width: '350px' }} active />
                <Skeleton active />
              </div>
            </>
          )}
          {isReady && doneCategoriesList.length === 0 && (
            <Space align={'center'} direction={'vertical'}>
              {quote && (
                <Space align={'center'} className={styles.quoteWrapper}>
                  <Quote author={quote.author} content={quote.quote} />
                </Space>
              )}
              <div
                style={{
                  position: 'relative',
                  width: '300px',
                  height: '200px',
                  marginBottom: '1em',
                }}
              >
                <Image
                  src={`/gifs/${emptyGif}`}
                  alt="Motivational gif"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div>
                <strong>
                  There's still time to get started! Also don't forget to check
                  off things you've already done{' '}
                  {titleStrings[dateRangeType].toLowerCase()}!
                </strong>
              </div>
            </Space>
          )}
          {isReady && doneCategoriesList.length > 0 && (
            <>
              <div className={styles.bg}>
                <Fireworks
                  ref={ref}
                  options={{ delay: { min: 100, max: 500 } }}
                  style={{
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '500px',
                    position: 'absolute',
                  }}
                />
              </div>
              <div>
                <DoneCount date={currentDate} dateRangeType={dateRangeType} />
                {quote && (
                  <Space align={'center'} className={styles.quoteWrapper}>
                    <Quote author={quote.author} content={quote.quote} />
                  </Space>
                )}
              </div>
              <div>
                <h1 style={{ marginBottom: 0 }}>
                  What I did {titleStrings[dateRangeType].toLocaleLowerCase()}:
                </h1>
                <div className={styles.chartContainer}>
                  <Chart
                    chartType="PieChart"
                    data={[
                      ['Category', 'Count'],
                      ...doneCategoriesList.map((c) => [
                        c.name,
                        getCategoryTotalCount(c),
                      ]),
                    ]}
                    options={{
                      is3D: true,
                      backgroundColor: 'transparent',
                      chartArea: {
                        width: '100%',
                      },
                      legend: { position: 'bottom' },
                      pieSliceTextStyle: {
                        color: '#000',
                      },
                      colors: doneCategoriesList.map(
                        (c) =>
                          c.color ||
                          Math.floor(Math.random() * 16777215).toString(16),
                      ),
                    }}
                    width={'100%'}
                    height={'400px'}
                  />
                </div>
                {doneCategoriesList.map((c) => {
                  const categoryTotal = getCategoryTotalCount(c)
                  return doneCategoriesList.length > 0 ? (
                    <div key={`doneCategory_${c.id}`}>
                      <h4 style={{ fontWeight: 700 }}>
                        {c.name}
                        {dateRangeType !== DateRangeType.DAY &&
                          ` (${categoryTotal})`}
                      </h4>
                      <ul
                        key={`category_${c.name}`}
                        style={{
                          fontSize: '1rem',
                          lineHeight: 1.25,
                          padding: 0,
                          listStylePosition: 'inside',
                          listStyle: 'none',
                        }}
                      >
                        {c.todos.map((t) => (
                          <li key={`todo_${t.id}`} className={styles.doneItem}>
                            {t.name}{' '}
                            {t.count > 1 && <strong>x{t.count}</strong>}
                            {t.size !== TodoSize.SMALL && (
                              <Tag color={sizeTags[t.size].color}>
                                {sizeTags[t.size].label}
                              </Tag>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                })}
              </div>
            </>
          )}
        </div>
      </Space>
    </Space>
  )
}

export default DonePage
