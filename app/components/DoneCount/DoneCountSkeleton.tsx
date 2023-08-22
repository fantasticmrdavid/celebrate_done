import React from 'react'
import styles from './doneCount.module.scss'
import { LoadingSpinner } from '@/app/components/LoadingSpinner/LoadingSpinner'

export const DoneCountSkeleton = () => {
  return (
    <div className={styles.container}>
      <LoadingSpinner />
    </div>
  )
}
