import React from 'react'

type Props = {
  count: number
}

export const DoneCount = ({ count }: Props) => {
  return <div>{count}</div>
}
