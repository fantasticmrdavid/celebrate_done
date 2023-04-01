import { WarningOutlined } from '@ant-design/icons'
import React from 'react'
import styles from './validationMessage.module.scss'

type Props = {
  message: string
}

export const ValidationMessage = ({ message }: Props) => (
  <div className={styles.message}>
    <WarningOutlined /> {message}
  </div>
)
