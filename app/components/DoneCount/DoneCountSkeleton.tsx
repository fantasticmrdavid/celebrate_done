import React from 'react'
import styles from './doneCount.module.scss'
import { Spin } from 'antd'

export const DoneCountSkeleton = () => {
  return (
    <div className={styles.container}>
      <Spin className={styles.spinner} size={'large'} />
    </div>
  )
}
