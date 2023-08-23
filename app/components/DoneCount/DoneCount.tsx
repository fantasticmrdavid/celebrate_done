import React from 'react'
import { CountUp } from 'use-count-up'
import styles from './doneCount.module.scss'
import {
  getLocalEndOfDay,
  getLocalEndOfYear,
  getLocalPastNinetyDays,
  getLocalPastSevenDays,
  getLocalStartOfDay,
  getLocalStartOfYear,
} from '@/app/utils'
import { DateRangeType } from '@/pages/done'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { DoneCountSkeleton } from '@/app/components/DoneCount/DoneCountSkeleton'

type Props = {
  date: string
  dateRangeType: DateRangeType
}

export const DoneCount = ({ dateRangeType, date }: Props) => {
  const getDateRangeQuery = () => {
    if (dateRangeType === DateRangeType.DAY) {
      return `dateRangeStart=${getLocalStartOfDay(
        date,
      )}&dateRangeEnd=${getLocalEndOfDay(date)}`
    }
    if (dateRangeType === DateRangeType.SEVEN_DAYS) {
      return `dateRangeStart=${getLocalPastSevenDays(
        date,
      )}&dateRangeEnd=${getLocalEndOfDay(date)}`
    }
    if (dateRangeType === DateRangeType.NINETY_DAYS) {
      return `dateRangeStart=${getLocalPastNinetyDays(
        date,
      )}&dateRangeEnd=${getLocalEndOfDay(date)}`
    }
    if (dateRangeType === DateRangeType.YEAR) {
      return `dateRangeStart=${getLocalStartOfYear(
        date,
      )}&dateRangeEnd=${getLocalEndOfYear(date)}`
    }
  }
  const { data: doneCount, isLoading } = useQuery<number>(
    ['getDoneTodosCount', date, dateRangeType] as unknown as QueryKey,
    async () =>
      await fetch(`/api/todos/doneCount?${getDateRangeQuery()}`).then((res) =>
        res.json(),
      ),
  )
  const isReady = doneCount && !isLoading
  return (
    <div className={styles.container}>
      {!isReady && <DoneCountSkeleton />}
      {isReady && (
        <>
          <div style={{ fontSize: '10rem' }}>
            <CountUp isCounting end={doneCount} />
          </div>
          <div>things done!</div>
        </>
      )}
    </div>
  )
}
