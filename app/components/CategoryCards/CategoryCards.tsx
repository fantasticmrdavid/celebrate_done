import React, { useContext, useState } from 'react'
import { QueryKey, useQuery } from '@tanstack/react-query'
import { Todo, TODO_STATUS } from '@/app/components/TodoItem/types'
import {
  Button,
  Collapse,
  DatePicker,
  Space,
  Spin,
  Tooltip,
  Typography,
} from 'antd'
import TodoFormModal, {
  TodoModal_Mode,
} from '@/app/components/TodoFormModal/TodoFormModal'
import dayjs from 'dayjs'
import { TodoItem } from '@/app/components/TodoItem/Todo'
import CategoryFormModal, {
  CategoryModal_Mode,
} from '@/app/components/CategoryFormModal/CategoryFormModal'
import { Category } from '@/app/components/CategoryFormModal/types'
import { EditOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { CategoriesContext } from '@/app/contexts/Categories'

const { Panel } = Collapse
const { Title } = Typography

export const CategoryCards = () => {
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString()
  )
  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)
  const [modalCategory, setModalCategory] = useState<Category | undefined>()
  const { categoryList } = useContext(CategoriesContext)

  const isToday = new Date(currentDate).getDate() === new Date().getDate()
  const isYesterday =
    new Date(currentDate).getDate() ===
    new Date(new Date().setDate(new Date().getDate() - 1)).getDate()
  const isTomorrow =
    new Date(currentDate).getDate() ===
    new Date(new Date().setDate(new Date().getDate() + 1)).getDate()

  const {
    isLoading,
    error,
    data: todoList,
    refetch: refetchTodoList,
  } = useQuery<Todo[]>(
    ['getTodos', currentDate] as unknown as QueryKey,
    async () =>
      await fetch(`/api/todos?date=${currentDate}`).then(
        (res) => res.json()
      ),
    {
      initialData: [],
    }
  )

  if (isLoading || !todoList)
    return (
      <Spin tip="Loading Todos" size="large">
        <div className="content" />
      </Spin>
    )

  if (error) return <div>ERROR FETCHING TODOS...</div>

  const getDateTitle = () => {
    if (isToday) return 'Today'
    if (isYesterday) return 'Yesterday'
    if (isTomorrow) return 'Tomorrow'

    return dayjs(new Date(currentDate)).format('ddd, MMM D, YYYY')
  }

  return (
    <>
      <Space
        style={{ display: 'flex', columnGap: '1em', paddingBottom: '1em' }}
      >
        <Title style={{ margin: 0 }}>{getDateTitle()}</Title>
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
        {categoryList.map((c) => {
          const filteredTodoList = todoList.filter(
            (t: Todo) => t.category.id === c.id
          )
          const doneCount = filteredTodoList.filter(
            (t) => t.status === TODO_STATUS.DONE
          )?.length
          return (
            <Collapse
              activeKey={filteredTodoList.length > 0 ? [c.id] : []}
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
                      <div>
                        {c.name}
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: '0.8rem',
                            marginLeft: '0.5em',
                          }}
                        >
                          {doneCount > 0 && ` 🎉 x${doneCount}`}
                        </span>
                      </div>
                      <div style={{ marginLeft: '1em' }}>
                        <Tooltip title={'Edit Category'}>
                          <Button
                            icon={<EditOutlined />}
                            onClick={() => {
                              setModalCategory(c)
                              setIsCategoryModalOpen(true)
                            }}
                          />
                        </Tooltip>
                        <Tooltip title={'Add Task'}>
                          <Button
                            icon={<PlusSquareOutlined />}
                            onClick={() => {
                              setModalCategory(c)
                              setIsTodoModalOpen(true)
                            }}
                          />
                        </Tooltip>
                      </div>
                    </Title>
                    <Space
                      style={{ marginBottom: '0.75em', fontSize: '0.8rem' }}
                    >
                      {c.description}
                    </Space>
                  </Space>
                }
              >
                {filteredTodoList.map((t: Todo) => (
                  <TodoItem
                    key={`todo_${t.id}`}
                    todo={t}
                    currentDate={currentDate}
                  />
                ))}
              </Panel>
            </Collapse>
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
            mode={CategoryModal_Mode.EDIT}
            category={modalCategory}
          />
        )}
      </Space>
    </>
  )
}
