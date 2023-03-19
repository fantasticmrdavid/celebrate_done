import React from 'react'
import { CountUp } from 'use-count-up'

type Props = {
  count: number
}

export const DoneCount = ({ count }: Props) => {
  return (
    <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
      <div style={{ fontSize: '10rem' }}>
        <CountUp isCounting end={count} />
      </div>
      <div>things done!</div>
    </div>
  )
}
