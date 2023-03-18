import React from 'react'
import styles from './doneCount.module.scss'

type Props = {
  count: number
}

export const DoneCount = ({ count }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.count}>{count}</div>
      <div>things done!</div>
    </div>
  )
}
