import React, { useContext, useState } from 'react'
import { QueryKey, useQuery } from '@tanstack/react-query'
import {
  Todo,
  TODO_PRIORITY,
  TODO_STATUS,
} from '@/app/components/TodoItem/types'
import { Button, Collapse, DatePicker, Space, Spin, Typography } from 'antd'
import TodoFormModal, {
  TodoModal_Mode,
} from '@/app/components/TodoFormModal/TodoFormModal'
import dayjs from 'dayjs'
import { TodoItem } from '@/app/components/TodoItem/Todo'
import CategoryFormModal, {
  CategoryModal_Mode,
} from '@/app/components/CategoryFormModal/CategoryFormModal'
import { Category } from '@/app/components/CategoryFormModal/types'
import { EditOutlined } from '@ant-design/icons'
import { CategoriesContext } from '@/app/contexts/Categories'

const { Panel } = Collapse
const { Title } = Typography

export const CategoryCards = () => {
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString()
  )
  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)
  const [todoModalMode, setTodoModalMode] = useState<TodoModal_Mode>(
    TodoModal_Mode.ADD
  )
  const [todoModalCategory, setTodoModalCategory] = useState<
    Category | undefined
  >()
  const { categoryList, isFetchingCategories } = useContext(CategoriesContext)

  const isToday = new Date(currentDate).getDate() === new Date().getDate()

  const {
    isLoading,
    error,
    data: todoList,
    refetch: refetchTodoList,
  } = useQuery<Todo[]>(
    ['getTodos', currentDate] as unknown as QueryKey,
    async () =>
      await fetch(`/api/todos${!isToday ? `?date=${currentDate}` : ''}`).then(
        (res) => res.json()
      ),
    {
      initialData: [],
    }
  )

  if (isLoading)
    return (
      <Spin tip="Loading Todos" size="large">
        <div className="content" />
      </Spin>
    )

  if (error) return <div>ERROR FETCHING TODOS...</div>

  return (
    <>
      <Space
        style={{ display: 'flex', columnGap: '1em', paddingBottom: '1em' }}
      >
        <Title style={{ margin: 0 }}>
          {isToday
            ? 'Today'
            : dayjs(new Date(currentDate)).format('ddd, MMM D, YYYY')}
        </Title>
        <DatePicker
          value={dayjs(new Date(currentDate))}
          allowClear={false}
          onChange={(_, dateString) => {
            setCurrentDate(dateString)
            refetchTodoList()
          }}
        />
      </Space>
      <Space
        size={'small'}
        align={'start'}
        style={{ display: 'flex', flexWrap: 'wrap' }}
      >
        {categoryList.map((c) => (
          <Collapse
            key={`category_${c.id}`}
            collapsible="icon"
            expandIconPosition={'end'}
            defaultActiveKey={c.id}
            size={'small'}
          >
            <Panel
              key={c.id}
              header={
                <Space direction={'vertical'} style={{ width: '100%' }}>
                  <Title
                    level={5}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: 0,
                    }}
                  >
                    <div>{c.name}</div>
                    <div style={{ marginLeft: '1em' }}>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          setTodoModalCategory(c)
                          setIsCategoryModalOpen(true)
                        }}
                      />
                      <Button
                        onClick={() => {
                          setTodoModalCategory(c)
                          setTodoModalMode(TodoModal_Mode.ADD)
                          setIsTodoModalOpen(true)
                        }}
                      >
                        + Task
                      </Button>
                    </div>
                  </Title>
                  <Space style={{ marginBottom: '0.75em', fontSize: '0.8rem' }}>
                    {c.description}
                  </Space>
                </Space>
              }
            >
              {todoList
                .filter((t: Todo) => t.category.id === c.id)
                .sort((a: Todo, b: Todo) => {
                  if (
                    a.status !== TODO_STATUS.DONE &&
                    a.priority === TODO_PRIORITY.URGENT
                  )
                    return -1
                  if (
                    b.status !== TODO_STATUS.DONE &&
                    b.priority === TODO_PRIORITY.URGENT
                  )
                    return 1
                  return a.status === TODO_STATUS.DONE ? 1 : -1
                })
                .map((t: Todo) => (
                  <TodoItem
                    key={`todo_${t.id}`}
                    todo={t}
                    currentDate={currentDate}
                  />
                ))}
            </Panel>
          </Collapse>
        ))}
        {isTodoModalOpen && (
          <TodoFormModal
            isOpen={true}
            onCancel={() => {
              setIsTodoModalOpen(false)
            }}
            category={todoModalCategory}
            mode={todoModalMode}
          />
        )}
        {isCategoryModalOpen && (
          <CategoryFormModal
            isOpen={isCategoryModalOpen}
            onCancel={() => {
              setIsCategoryModalOpen(false)
              setTodoModalCategory(undefined)
            }}
            mode={CategoryModal_Mode.EDIT}
            category={todoModalCategory}
          />
        )}
      </Space>
    </>
  )
}
