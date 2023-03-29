import React from 'react'
import styles from "./quote.module.scss"

type Props = {
  author: string,
  content: string
}

export const Quote = ({ author, content }: Props) => (
  <div className={styles.container}>
    <div className={styles.content}>{content}</div>
    <div className={styles.author}>- {author}</div>
  </div>
)