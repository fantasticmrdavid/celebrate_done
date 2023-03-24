import React from 'react'
import { CategoryCards } from '@/app/components/CategoryCards/CategoryCards'
import styles from "./todosPage.module.scss"

export const TodosPage = () => {
  return (
    <div className={styles.container}>
      <CategoryCards />
    </div>
  )
}

export default TodosPage
