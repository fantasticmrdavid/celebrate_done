import React from 'react'
import { CountUp } from 'use-count-up'
import styles from "./doneCount.module.scss"

type Props = {
  count: number
}

export const DoneCount = ({ count }: Props) => {
  return (
    <div className={styles.container}>
      <div style={{ fontSize: '10rem' }}>
        <CountUp isCounting end={count} />
      </div>
      <div>things done!</div>
    </div>
  )
}
