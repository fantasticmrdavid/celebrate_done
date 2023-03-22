import React, {useContext, useEffect, useState} from 'react'
import {QueryKey, useQuery, useQueryClient} from '@tanstack/react-query'
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
import {
  EditOutlined,
  FolderAddOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons'
import { CategoriesContext } from '@/app/contexts/Categories'
import { UserContext } from '@/app/contexts/User'
import styles from './categoryCards.module.scss'

const { Panel } = Collapse
const { Title } = Typography

export const CategoryCards = () => {
  const queryClient = useQueryClient()
  const { user } = useContext(UserContext)
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<string>(
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
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
      await fetch(
        `/api/todos?user_id=${user?.uuid || ''}&date=${currentDate}`
      ).then((res) => res.json())
  )
  useEffect(() => {
    refetchTodoList()
  }, [currentDate])

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
      <Space size={'small'} className={styles.categoryCardContainer}>
        {categoryList.map((c) => {
          const filteredTodoList = todoList.filter(
            (t: Todo) => t.category.uuid === c.uuid
          )
          const doneCount = filteredTodoList.filter(
            (t) => t.status === TODO_STATUS.DONE
          )?.length
          return (
            <Collapse
              activeKey={filteredTodoList.length > 0 ? [c.uuid] : []}
              key={`category_${c.uuid}`}
              collapsible="icon"
              expandIconPosition={'end'}
              defaultActiveKey={c.uuid}
              size={'small'}
            >
              <Panel
                key={c.uuid}
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
                      <div className={styles.categoryCardTitle}>
                        {c.name}
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
