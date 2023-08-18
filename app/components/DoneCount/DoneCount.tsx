import React from 'react'
import { CountUp } from 'use-count-up'
import styles from './doneCount.module.scss'
import { dateIsoToSql } from '@/pages/api/utils'
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
import { useSession } from 'next-auth/react'

type Props = {
  date: string
  dateRangeType: DateRangeType
}

export const DoneCount = ({ dateRangeType, date }: Props) => {
  const { data: session } = useSession()
  const getDateRangeQuery = () => {
    if (dateRangeType === DateRangeType.DAY) {
      return `dateRangeStart=${dateIsoToSql(getLocalStartOfDay(date))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfDay(date))}`
    }
    if (dateRangeType === DateRangeType.SEVEN_DAYS) {
      return `dateRangeStart=${dateIsoToSql(getLocalPastSevenDays(date))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfDay(date))}`
    }
    if (dateRangeType === DateRangeType.NINETY_DAYS) {
      return `dateRangeStart=${dateIsoToSql(getLocalPastNinetyDays(date))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfDay(date))}`
    }
    if (dateRangeType === DateRangeType.YEAR) {
      return `dateRangeStart=${dateIsoToSql(getLocalStartOfYear(date))}
        &dateRangeEnd=${dateIsoToSql(getLocalEndOfYear(date))}`
    }
  }
  const { data: doneCount, isLoading } = useQuery<number>(
    ['getDoneTodosCount', date, dateRangeType] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos/doneCount?userId=${session?.user
          ?.id}&${getDateRangeQuery()}`,
      ).then((res) => res.json()),
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
