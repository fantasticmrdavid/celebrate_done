import React, { useContext, useEffect, useState } from 'react'
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Todo,
  TODO_PRIORITY,
  TODO_STATUS,
} from '@/app/components/TodoItem/types'
import { Button, DatePicker, Space, Spin, Tooltip, Typography } from 'antd'
import TodoFormModal, {
  TodoModal_Mode,
} from '@/app/components/TodoFormModal/TodoFormModal'
import dayjs from 'dayjs'
import CategoryFormModal, {
  CategoryModal_Mode,
} from '@/app/components/CategoryFormModal/CategoryFormModal'
import { Category } from '@/app/components/CategoryFormModal/types'
import { FolderAddOutlined } from '@ant-design/icons'
import { CategoriesContext } from '@/app/contexts/Categories'
import { UserContext } from '@/app/contexts/User'
import styles from './categoryCardList.module.scss'
import { dateIsoToSql } from '@/pages/api/utils'
import {
  getLocalEndOfDay,
  getLocalStartOfDay,
  isToday,
  isTomorrow,
  isYesterday,
} from '@/app/utils'
import { Quote } from '@/app/components/Quote/Quote'
import quoteList from '@/app/data/quotes'
import { CategoryCard } from '@/app/components/CategoryCard/CategoryCard'

const { Title } = Typography

const sortTodoList = (tList: Todo[]) => {
  return tList.sort((a, b) => {
    if (a.status === TODO_STATUS.DONE || b.status === TODO_STATUS.DONE)
      return 0
    if (
      a.priority === TODO_PRIORITY.URGENT &&
      b.priority !== TODO_PRIORITY.URGENT
    )
      return -1
    if (
      a.priority !== TODO_PRIORITY.URGENT &&
      b.priority === TODO_PRIORITY.URGENT
    )
      return 1
    return a.sortOrder < b.sortOrder ? -1 : 1
  })
}

export const CategoryCardList = () => {
  const queryClient = useQueryClient()
  const { user } = useContext(UserContext)
  const today = new Date()
  const [currentDate, setCurrentDate] = useState<string>(today.toISOString())

  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)
  const [modalCategory, setModalCategory] = useState<Category | undefined>()
  const { categoryList } = useContext(CategoriesContext)

  const {
    isLoading,
    error,
    data: todoList,
    refetch: refetchTodoList,
  } = useQuery<Todo[]>(
    ['getTodos', currentDate] as unknown as QueryKey,
    async () =>
      await fetch(
        `/api/todos?user_id=${user?.uuid || ''}
        &localStartOfDay=${dateIsoToSql(getLocalStartOfDay(currentDate))}
        &localEndOfDay=${dateIsoToSql(getLocalEndOfDay(currentDate))}`
      ).then((res) => res.json())
  )

  useEffect(() => {
    refetchTodoList()
  }, [currentDate, refetchTodoList])

  const quote = quoteList[(quoteList.length * Math.random()) | 0]

  if (isLoading || !todoList) return <Spin tip="Loading Todos" size="large" />

  if (error) return <div>ERROR FETCHING TODOS...</div>

  const getDateTitle = () => {
    if (isToday(currentDate)) return 'Today'
    if (isYesterday(currentDate)) return 'Yesterday'
    if (isTomorrow(currentDate)) return 'Tomorrow'

    return dayjs(new Date(currentDate)).format('ddd, MMM D, YYYY')
  }

  // NOTE: OPTIMISTIC UPDATING
  const sortAllTodoList = async (tList: Todo[]) => {
    const sortedTodoList = sortTodoList(todoList
      .map((t) => {
        const updatedTodoIndex = tList.findIndex((tt) => tt.id === t.id)
        return {
          ...t,
          sortOrder: updatedTodoIndex !== -1 ? updatedTodoIndex : t.sortOrder,
        }
      }))

    await queryClient.cancelQueries(['getTodos', currentDate])
    const previousTodoList = queryClient.getQueryData(['getTodos', currentDate])
    queryClient.setQueryData(['getTodos', currentDate], sortedTodoList)
    return { previousTodoList }
  }

  const addToTodoList = async (t: Todo) => {
    const newTodoList = sortTodoList([
      ...todoList,
      t
    ])
    await queryClient.cancelQueries(['getTodos', currentDate])
    const previousTodoList = queryClient.getQueryData(['getTodos', currentDate])
    queryClient.setQueryData(['getTodos', currentDate], newTodoList)
    return { previousTodoList }
  }

  const toggleCompleteTodo = async (todo: Todo, status: TODO_STATUS) => {
    await queryClient.cancelQueries(['getTodos', currentDate])
    const previousTodoList = queryClient.getQueryData(['getTodos', currentDate])
    queryClient.setQueryData(['getTodos', currentDate], sortTodoList(
      todoList.map(t => t.id === todo.id ? {
        ...todo,
        status
      } : t))
    )
    return { previousTodoList }
  }

  return (
    <>
      <Space className={styles.header}>
        <Space className={styles.headerDate}>
          <Title style={{ margin: 0 }}>{getDateTitle()}</Title>
          <DatePicker
            value={dayjs(new Date(currentDate))}
            allowClear={false}
            onChange={(_, dateString) => {
              setCurrentDate(dateString)
            }}
          />
        </Space>
        <Tooltip title={'Add Category'}>
          <Button
            onClick={() => {
              setModalCategory(undefined)
              setIsCategoryModalOpen(true)
            }}
          >
            <FolderAddOutlined />
            <div className={styles.buttonText}>Add Category</div>
          </Button>
        </Tooltip>
      </Space>
      {quote && (
        <Space align={'center'}>
          <Quote author={quote.author} content={quote.quote} />
        </Space>
      )}
      <Space size={'small'} className={styles.categoryCardContainer}>
        {categoryList.map((c, i) => {
          const filteredTodoList = todoList.filter(
            (t: Todo) => t.category.uuid === c.uuid
          )

          return (
            <CategoryCard
              isFirst={i === 0}
              isLast={i === categoryList.length - 1}
              key={`category_${c.uuid}`}
              category={c}
              todoList={filteredTodoList}
              currentDate={currentDate}
              onAddTaskClick={() => {
                setModalCategory(c)
                setIsTodoModalOpen(true)
              }}
              onEditCategoryClick={() => {
                setModalCategory(c)
                setIsCategoryModalOpen(true)
              }}
              onSort={sortAllTodoList}
              onAdd={addToTodoList}
              onComplete={toggleCompleteTodo}
            />
          )
        })}
        {isTodoModalOpen && (
          <TodoFormModal
            isOpen={true}
            onCancel={() => {
              setIsTodoModalOpen(false)
            }}
            category={modalCategory}
            mode={TodoModal_Mode.ADD}
          />
        )}
        {isCategoryModalOpen && (
          <CategoryFormModal
            isOpen={isCategoryModalOpen}
            onCancel={() => {
              setIsCategoryModalOpen(false)
              setModalCategory(undefined)
            }}
            mode={
              modalCategory ? CategoryModal_Mode.EDIT : CategoryModal_Mode.ADD
            }
            category={modalCategory}
          />
        )}
      </Space>
    </>
  )
}
