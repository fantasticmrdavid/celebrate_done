import React, { useContext } from 'react'
import { CountUp } from 'use-count-up'
import styles from './doneCount.module.scss'
import { dateIsoToSql } from '@/pages/api/utils'
import {
  getLocalEndOfDay,
  getLocalEndOfMonth,
  getLocalEndOfWeek,
  getLocalEndOfYear,
  getLocalStartOfDay,
  getLocalStartOfMonth,
  getLocalStartOfWeek,
  getLocalStartOfYear,
} from '@/app/utils'
import { DateRangeType } from '@/pages/done'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { UserContext } from '@/app/contexts/User'
import { DoneTodoCount } from '@/pages/api/todos/doneCount'
import { Spin } from 'antd'

type Props = {
  count: number
  date: string
  dateRangeType: DateRangeType
}

export const DoneCount = ({ dateRangeType, date }: Props) => {
  const { user } = useContext(UserContext)
  const getDateRangeQuery = () => {
    if (dateRangeType === DateRangeType.DAY) {
      return `dateRangeStart=${dateIsoToSql(getLocalStartOfDay(date))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfDay(date))}`
    }
    if (dateRangeType === DateRangeType.WEEK) {
      return `dateRangeStart=${dateIsoToSql(getLocalStartOfWeek(date))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfWeek(date))}`
    }
    if (dateRangeType === DateRangeType.MONTH) {
      return `dateRangeStart=${dateIsoToSql(getLocalStartOfMonth(date))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfMonth(date))}`
    }
    if (dateRangeType === DateRangeType.YEAR) {
      return `dateRangeStart=${dateIsoToSql(getLocalStartOfYear(date))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfYear(date))}`
    }
  }
  const { data: doneCount, isLoading } = useQuery<DoneTodoCount>(
    ['getDoneTodosCount', date, dateRangeType] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos/doneCount?user_id=${user.uuid}&${getDateRangeQuery()}`
      ).then((res) => res.json())
  )
  const isReady = doneCount && !isLoading
  return (
    <div className={styles.container}>
      {!isReady && <Spin size={'large'} />}
      {isReady && (
        <>
          <div style={{ fontSize: '10rem' }}>
            <CountUp isCounting end={doneCount.count} />
          </div>
          <div>things done!</div>
        </>
      )}
    </div>
  )
}
