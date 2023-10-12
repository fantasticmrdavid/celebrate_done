import React, { useState } from 'react'
import { CountUp } from 'use-count-up'
import classNames from 'classnames'
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
  onCountComplete?: () => void
}

export const DoneCount = ({ dateRangeType, date, onCountComplete }: Props) => {
  const [isComplete, setIsComplete] = useState(false)
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

  const counterClassNames = classNames({
    [styles.count]: true,
    [styles.countComplete]: isComplete && doneCount && doneCount < 1000,
    [styles.countCompleteThousand]:
      isComplete && doneCount && doneCount >= 1000,
  })

  return (
    <div className={styles.container}>
      {!isReady && <DoneCountSkeleton />}
      {isReady && (
        <>
          <div className={counterClassNames}>
            <CountUp
              isCounting
              end={doneCount}
              onComplete={() => {
                setIsComplete(true)
                if (onCountComplete) onCountComplete()
              }}
            />
          </div>
          <div>things done!</div>
        </>
      )}
    </div>
  )
}
