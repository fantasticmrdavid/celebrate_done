import React from 'react'

type Props = {
  count: number
}

export const DoneCount = ({ count }: Props) => {
  return (
    <div style={{ textAlign: 'center', fontWeight: 700 }}>
      <div style={{ fontSize: '10rem' }}>{count}</div>
      <div>things done!</div>
    </div>
  )
}
