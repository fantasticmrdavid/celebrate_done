import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Button, Collapse, Space, Tooltip, Typography } from 'antd'
import styles from './categoryCard.module.scss'
import {
  ArrowUpOutlined,
  EditOutlined,
  PlusSquareOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { TodoItem } from '@/app/components/TodoItem/Todo'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { CategoriesContext } from '@/app/contexts/Categories'
import { arrayMoveImmutable } from 'array-move'
import { EmptyCategoryMessage } from './EmptyCategoryMessage'
import { SelectedDateContext } from '@/app/contexts/SelectedDate'
import {
  TodoWithRelations,
  TodoWithRelationsNoCategory,
} from '@/pages/api/todos/getTodos'
import { CategoryWithRelations } from '@/pages/api/categories/getCategories'
import { Todo, TodoStatus } from '@prisma/client'
import { getSortedTodoList } from '@/pages/api/utils'
import { isAAAContrast } from 'accessible-colors'
import { toast } from 'react-toastify'

const { Title } = Typography

type Props = {
  isFirst: boolean
  isLast: boolean
  category: CategoryWithRelations
  onAddTaskClick: () => void
  onEditCategoryClick: () => void
}

type SortParams = {
  newPosition: number
}

export const CategoryCard = ({
  isFirst,
  isLast,
  category,
  onAddTaskClick,
  onEditCategoryClick,
}: Props) => {
  const queryClient = useQueryClient()
  const { categoryList } = useContext(CategoriesContext)

  const [localTodoList, setLocalTodoList] = useState<
    TodoWithRelationsNoCategory[]
  >(category.todos)
  const [isExpanded, setIsExpanded] = useState(!category.isCollapsed)
  const { currentDate } = useContext(SelectedDateContext)

  useEffect(() => {
    setLocalTodoList(category.todos)
  }, [category.todos])

  const optimisticUpdateTodoList = async (t: Omit<Todo, 'userId'>) => {
    const newTodoList = getSortedTodoList([...localTodoList, t])
    await queryClient.cancelQueries(['getCategories', currentDate])
    const previousCategoriesList = queryClient.getQueryData([
      'getCategories',
      currentDate,
    ]) as CategoryWithRelations[]

    const updatedCategoriesList = previousCategoriesList.map((c) =>
      c.id === category?.id
        ? {
            ...c,
            todos: newTodoList,
          }
        : c,
    )

    queryClient.setQueryData(
      ['getCategories', currentDate],
      updatedCategoriesList,
    )
    return { previousCategoriesList }
  }

  const updateSortedTodoList = useCallback(
    (srcIndex: number, destIndex: number) => {
      setLocalTodoList((localTodoList) =>
        arrayMoveImmutable(localTodoList, srcIndex, destIndex).map((c, i) => ({
          ...c,
          sortOrder:
            localTodoList.filter((t) => t.status === TodoStatus.INCOMPLETE)
              .length -
            (i - 1),
        })),
      )
    },
    [],
  )

  const sortTodoList = useMutation({
    mutationFn: () =>
      axios.patch('/api/todos', {
        todoList: localTodoList,
        action: 'updateSortOrder',
      }),
    onMutate: async () => {
      await queryClient.cancelQueries(['getCategories', currentDate])
      const previousTodoList = queryClient.getQueryData([
        'getCategories',
        currentDate,
      ]) as TodoWithRelations[]
      queryClient.setQueryData(
        ['getCategories', currentDate],
        categoryList.map((c) =>
          c.id === category.id
            ? {
                ...c,
                todos: getSortedTodoList(localTodoList),
              }
            : c,
        ),
      )
      return { previousTodoList }
    },
    onError: (error) => {
      console.log('ERROR: ', error)
      toast.error(<>Error sorting todo list. Check console for details.</>, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'colored',
      })
    },
  })

  const getSortedCategories = (newPosition: number) => {
    const currentCategoryIndex = categoryList.findIndex(
      (c) => c.id === category.id,
    )
    return arrayMoveImmutable(
      categoryList,
      currentCategoryIndex,
      newPosition,
    ).map((c, i) => ({ ...c, sortOrder: i }))
  }

  const sortCategory = useMutation({
    mutationFn: (req: SortParams) => {
      return axios.patch('/api/categories/sort', {
        categoryList: getSortedCategories(req.newPosition),
      })
    },
    onMutate: async (req: SortParams) => {
      await queryClient.cancelQueries(['getCategories', currentDate])
      const previousCategoriesList = queryClient.getQueryData([
        'getCategories',
        currentDate,
      ])
      queryClient.setQueryData(
        ['getCategories', currentDate],
        getSortedCategories(req.newPosition),
      )
      return { previousCategoriesList }
    },
    onError: (error) => {
      console.log('ERROR: ', error)
      toast.error(<>Error updating category. Check console for details.</>, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'colored',
      })
    },
  })

  const toggleExpand = useMutation({
    mutationFn: () =>
      axios.patch('/api/categories', {
        action: 'toggleCollapse',
        id: category.id,
        isCollapsed: !isExpanded,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['getCategories', currentDate])
    },
    onError: (error) => {
      console.log('ERROR: ', error)
      toast.error(<>Error updating category. Check console for details.</>, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'colored',
      })
    },
  })

  const doneCount = category.todos.filter((t) => t.status === TodoStatus.DONE)
    ?.length

  const titleTextColor = category.color
    ? isAAAContrast(category?.color, '#000000')
      ? '#000'
      : '#FFF'
    : undefined

  return (
    <Collapse
      style={{
        backgroundColor: category.color || undefined,
      }}
      defaultActiveKey={isExpanded ? [category.id] : []}
      key={`category_${category.id}`}
      collapsible="icon"
      expandIconPosition={'end'}
      size={'small'}
      onChange={(idList) => {
        setIsExpanded(idList.includes(category.id))
        toggleExpand.mutate()
      }}
      items={[
        {
          key: category.id,
          label: (
            <Space
              direction={'vertical'}
              style={{ width: '100%', paddingLeft: '0.5em' }}
            >
              <Title
                level={5}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: 0,
                  color: titleTextColor,
                }}
              >
                <div className={styles.categoryCardTitle}>
                  {category.name}
                  {!isExpanded && ` (${category.todos.length})`}
                  <div
                    className={styles.categoryCardDoneCount}
                    style={{
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      marginLeft: '0.5em',
                    }}
                  >
                    {doneCount > 0 && ` 🎉 x${doneCount}`}
                  </div>
                </div>
                <div style={{ display: 'flex', marginLeft: '1em' }}>
                  {!isFirst && (
                    <Tooltip title={'Move up'}>
                      <Button
                        icon={<ArrowUpOutlined />}
                        onClick={() =>
                          sortCategory.mutate({
                            newPosition: category.sortOrder - 1,
                          })
                        }
                      />
                    </Tooltip>
                  )}
                  {!isLast && (
                    <Tooltip title={'Move down'}>
                      <Button
                        icon={<ArrowDownOutlined />}
                        onClick={() =>
                          sortCategory.mutate({
                            newPosition: category.sortOrder + 1,
                          })
                        }
                      />
                    </Tooltip>
                  )}
                  <Tooltip title={'Edit Category'}>
                    <Button
                      icon={<EditOutlined />}
                      onClick={onEditCategoryClick}
                    />
                  </Tooltip>
                  <Tooltip
                    title={'Add Task'}
                    open={
                      localTodoList.length === 0 && categoryList.length === 1
                        ? true
                        : undefined
                    }
                  >
                    <Button
                      icon={<PlusSquareOutlined />}
                      onClick={onAddTaskClick}
                    />
                  </Tooltip>
                </div>
              </Title>
              {category.description.length > 0 && (
                <Space
                  style={{
                    marginBottom: '0.75em',
                    fontSize: '0.8rem',
                    color: titleTextColor,
                  }}
                >
                  {category.description}
                </Space>
              )}
            </Space>
          ),
          children:
            localTodoList.length > 0 ? (
              localTodoList.map((t: TodoWithRelationsNoCategory, i) => (
                <TodoItem
                  key={`todo_${t.id}`}
                  todo={t}
                  category={category}
                  schedule={t.schedule}
                  index={i}
                  onDrag={updateSortedTodoList}
                  onSort={sortTodoList.mutate}
                  onAddProgress={optimisticUpdateTodoList}
                />
              ))
            ) : (
              <EmptyCategoryMessage />
            ),
        },
      ]}
    />
  )
}
