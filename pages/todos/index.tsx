import React from 'react'
import { CategoryCardList } from '@/app/components/CategoryCardList/CategoryCardList'
import styles from "./todosPage.module.scss"

export const TodosPage = () => {
  return (
    <div className={styles.container}>
      <CategoryCardList />
    </div>
  )
}

export default TodosPage
