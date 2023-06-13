import React from 'react'
import styles from './footer.module.scss'

export const Footer = () => {
  return (
    <div
      className={styles.footer}
    >{`Copyright ${new Date().getFullYear()} CelebrateDone`}</div>
  )
}
