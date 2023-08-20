import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Button, DatePicker, Modal, Space, Tooltip, Typography } from 'antd'
import TodoFormModal, {
  TodoModal_Mode,
} from '@/app/components/TodoFormModal/TodoFormModal'
import dayjs from 'dayjs'
import CategoryFormModal, {
  CategoryModal_Mode,
} from '@/app/components/CategoryFormModal/CategoryFormModal'
import { FolderAddOutlined } from '@ant-design/icons'
import { CategoriesContext } from '@/app/contexts/Categories'
import styles from './categoryCardList.module.scss'
import { isToday, isTomorrow, isYesterday } from '@/app/utils'
import { Quote } from '@/app/components/Quote/Quote'
import quoteList from '@/app/data/quotes'
import { CategoryCard } from '@/app/components/CategoryCard/CategoryCard'
import { CategoryCardSkeleton } from '@/app/components/CategoryCard/CategoryCardSkeleton'
import { isMobile } from 'react-device-detect'
import { EmptyCategoriesMessage } from '@/app/components/CategoryCardList/EmptyCategoriesMessage'
import { SelectedDateContext } from '@/app/contexts/SelectedDate'
import { Category } from '@prisma/client'

const { Title } = Typography

export const CategoryCardList = () => {
  const { currentDate, setCurrentDate } = useContext(SelectedDateContext)
  const today = new Date()

  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)
  const [modalCategory, setModalCategory] = useState<Category | undefined>()

  const { categoryList, isFetchingCategories, isFetchingCategoriesError } =
    useContext(CategoriesContext)

  const [shouldPromptUserToRefresh, setShouldPromptUserToRefresh] =
    useState(false)
  const lastActivity = localStorage.getItem('isFirstActivityToday')

  useEffect(() => {
    if (
      lastActivity !== null &&
      !isToday(lastActivity) &&
      !isToday(currentDate)
    ) {
      setShouldPromptUserToRefresh(true)
    } else {
      localStorage.setItem('isFirstActivityToday', new Date().toISOString())
    }
  }, [lastActivity, currentDate])

  const quote = quoteList[(quoteList.length * Math.random()) | 0]

  const getDateTitle = useCallback(() => {
    if (isToday(currentDate)) return 'Today'
    if (isYesterday(currentDate)) return 'Yesterday'
    if (isTomorrow(currentDate)) return 'Tomorrow'

    return dayjs(new Date(currentDate)).format('ddd, MMM D, YYYY')
  }, [currentDate])

  const openCategoryModal = useCallback((c: Category) => {
    setModalCategory(c)
    setIsCategoryModalOpen(true)
  }, [])

  const openTodoModal = useCallback((c: Category) => {
    setModalCategory(c)
    setIsTodoModalOpen(true)
  }, [])

  if (isFetchingCategories)
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

  if (isFetchingCategoriesError) return <div>ERROR FETCHING TODOS...</div>

  const categoryCards = categoryList.map((c, i) => {
    return (
      <CategoryCard
        isFirst={i === 0}
        isLast={i === categoryList.length - 1}
        key={`category_${c.id}`}
        category={c}
        onAddTaskClick={() => openTodoModal(c)}
        onEditCategoryClick={() => openCategoryModal(c)}
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
        <Tooltip
          title={'Add Category'}
          open={categoryList.length === 0 ? true : undefined}
        >
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
      {categoryList.length === 0 && !isFetchingCategories && (
        <EmptyCategoriesMessage />
      )}
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
            setShouldPromptUserToRefresh(false)
            setCurrentDate(today.toISOString())
          }}
          onCancel={() => {
            localStorage.setItem('isFirstActivityToday', today.toISOString())
            setShouldPromptUserToRefresh(false)
          }}
          okText={'Yes'}
          cancelText={'No'}
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
