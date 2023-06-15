import React, { useContext, useEffect, useState } from 'react'
import { QueryKey, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Todo,
  TODO_PRIORITY,
  TODO_STATUS,
} from '@/app/components/TodoItem/types'
import { Button, DatePicker, Modal, Space, Tooltip, Typography } from 'antd'
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
import ConfettiExplosion from 'react-confetti-explosion'
import { CategoryCardSkeleton } from '@/app/components/CategoryCard/CategoryCardSkeleton'
import { isMobile } from 'react-device-detect'

const { Title } = Typography

const sortTodoList = (tList: Todo[]) => {
  return tList.sort((a, b) => {
    if (a.status === TODO_STATUS.DONE || b.status === TODO_STATUS.DONE) return 0
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
  const [isExploding, setIsExploding] = useState<boolean>(false)

  const { categoryList } = useContext(CategoriesContext)

  const [shouldPromptUserToRefresh, setshouldPromptUserToRefresh] =
    useState(false)
  const lastActivity = localStorage.getItem('isFirstActivityToday')

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

  useEffect(() => {
    if (
      lastActivity !== null &&
      !isToday(lastActivity) &&
      !isToday(currentDate)
    ) {
      setshouldPromptUserToRefresh(true)
    }
  }, [lastActivity, currentDate])

  const quote = quoteList[(quoteList.length * Math.random()) | 0]

  const getDateTitle = () => {
    if (isToday(currentDate)) return 'Today'
    if (isYesterday(currentDate)) return 'Yesterday'
    if (isTomorrow(currentDate)) return 'Tomorrow'

    return dayjs(new Date(currentDate)).format('ddd, MMM D, YYYY')
  }

  if (isLoading || !todoList)
    return (
      <>
        <Space className={styles.header}>
          <Space className={styles.headerDate}>
            <Title style={{ margin: 0 }}>{getDateTitle()}</Title>
            <DatePicker value={dayjs(new Date(currentDate))} disabled />
          </Space>
          <Button disabled>
            <FolderAddOutlined />
          </Button>
        </Space>
        {quote && (
          <Space align={'center'}>
            <Quote author={quote.author} content={quote.quote} />
          </Space>
        )}
        <Space size={'small'} className={styles.categoryCardContainer}>
          <CategoryCardSkeleton />
          <CategoryCardSkeleton />
          <CategoryCardSkeleton />
        </Space>
        {!isMobile && (
          <Space
            size={'small'}
            className={styles.categoryCardContainer}
            style={{ marginTop: '2em' }}
          >
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
          </Space>
        )}
      </>
    )

  if (error) return <div>ERROR FETCHING TODOS...</div>

  // NOTE: OPTIMISTIC UPDATING
  const addToTodoList = async (t: Todo) => {
    const newTodoList = sortTodoList([...todoList, t])
    await queryClient.cancelQueries(['getTodos', currentDate])
    const previousTodoList = queryClient.getQueryData(['getTodos', currentDate])
    queryClient.setQueryData(['getTodos', currentDate], newTodoList)
    return { previousTodoList }
  }

  const toggleCompleteTodo = async (todo: Todo, status: TODO_STATUS) => {
    await queryClient.cancelQueries(['getTodos', currentDate])
    const previousTodoList = queryClient.getQueryData(['getTodos', currentDate])
    queryClient.setQueryData(
      ['getTodos', currentDate],
      sortTodoList(
        todoList.map((t) =>
          t.id === todo.id
            ? {
                ...todo,
                status,
              }
            : t
        )
      )
    )
    if (status === TODO_STATUS.DONE) {
      setIsExploding(true)
      setTimeout(() => {
        setIsExploding(false)
      }, 3000)
    }
    return { previousTodoList }
  }

  const categoryCards = categoryList.map((c, i) => {
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
        onAdd={addToTodoList}
        onComplete={toggleCompleteTodo}
      />
    )
  })

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
      <Space
        style={{
          position: 'absolute',
          width: '100%',
          top: '10%',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {isExploding && (
          <ConfettiExplosion duration={3000} particleCount={100} width={1600} />
        )}
      </Space>
      <Space size={'small'} className={styles.categoryCardContainer}>
        {categoryCards}
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
        <Modal
          title="It's a new day!"
          open={shouldPromptUserToRefresh}
          onOk={() => {
            localStorage.setItem('isFirstActivityToday', today.toISOString())
            setshouldPromptUserToRefresh(false)
            setCurrentDate(today.toISOString())
          }}
          onCancel={() => {
            localStorage.setItem('isFirstActivityToday', today.toISOString())
            setshouldPromptUserToRefresh(false)
          }}
          okText={'Yeah'}
          cancelText={'Nah'}
        >
          <p>
            A brand new day lies ahead! Should we set the date to the current
            day?
          </p>
        </Modal>
      </Space>
    </>
  )
}
