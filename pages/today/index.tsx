import React from 'react'
import { Space } from 'antd'
import styles from './todayPage.module.scss'

export const TodayPage = () => {
  // Fetch today's todos
  // Update todos completed status action

  // Add "isToday" column to Todo table
  // Prompt to carry over any leftover todos at the start of the day

  return (
    <Space direction={'vertical'} align={'center'} style={{ width: '100%' }}>
      <div className={styles.content}>
        <div>
          <h1>What's happening today</h1>
        </div>
        <div>
          <h2>To Do:</h2>
          {/*
            List todos that:
            - Are assigned from the backlog
            - Were completed today
          */}
        </div>
      </div>
    </Space>
  )
}

export default TodayPage
