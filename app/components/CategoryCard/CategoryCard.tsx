import React, { memo } from 'react'
import { Todo, TODO_STATUS } from '@/app/components/TodoItem/types'
import {Button, Collapse, notification, Space, Tooltip, Typography} from 'antd'
import styles from './categoryCard.module.scss'
import {DownOutlined, EditOutlined, PlusSquareOutlined, UpOutlined} from '@ant-design/icons'
import { TodoDropZone } from '@/app/components/TodoDropZone/TodoDropZone'
import { TodoItem } from '@/app/components/TodoItem/Todo'
import { Category } from '@/app/components/CategoryFormModal/types'
import { DragLayer } from '@/app/components/CategoryCard/DragLayer'
import {useMutation, useQueryClient} from "@tanstack/react-query";
import axios from 'axios'

const { Panel } = Collapse
const { Title } = Typography

type Props = {
  isFirst: boolean
  isLast: boolean
  category: Category
  todoList: Todo[]
  currentDate: string
  onAddTaskClick: () => void
  onEditCategoryClick: () => void
  onSort: (tList: Todo[]) => Promise<{ previousTodoList: unknown }>
  onAdd: (t: Todo) => Promise<{ previousTodoList: unknown }>
  onComplete: (t: Todo, status: TODO_STATUS) => Promise<{ previousTodoList: unknown }>
}

type SortParams = {
  category: Category
}

export const _CategoryCard = ({
  isFirst,
  isLast,
  todoList,
  category,
  currentDate,
  onAddTaskClick,
  onEditCategoryClick,
  onSort,
  onAdd,
  onComplete
}: Props) => {
  const queryClient = useQueryClient()
  const sortCategory = useMutation({
    mutationFn: (req: SortParams) =>
      axios.patch('/api/categories', req.category),
    onSuccess: () => {
      queryClient.invalidateQueries(['getCategories'])
    },
    onError: (error) => {
      console.log('ERROR: ', error)
      notification.error({
        message: <>Error updating category. Check console for details.</>,
      })
    },
  })

  const doneCount = todoList.filter(
    (t) => t.status === TODO_STATUS.DONE
  )?.length

  return (
    <Collapse
      defaultActiveKey={todoList.length > 0 ? [category.uuid] : []}
      key={`category_${category.uuid}`}
      collapsible="icon"
      expandIconPosition={'end'}
      size={'small'}
    >
      <Panel
        key={category.uuid}
        header={
          <Space
            direction={'vertical'}
            style={{ width: '100%' }}
          >
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
                {category.name}
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
                {
                  !isFirst && (
                    <Tooltip title={'Move up'}>
                      <Button
                        icon={<UpOutlined />}
                        onClick={() => sortCategory.mutate({
                          category: {
                            ...category,
                            sortOrder: category.sortOrder - 1
                          }
                        })}
                      />
                    </Tooltip>
                  )
                }
                {
                  !isLast && (
                    <Tooltip title={'Move down'}>
                      <Button
                        icon={<DownOutlined />}
                        onClick={() => sortCategory.mutate({
                          category: {
                            ...category,
                            sortOrder: category.sortOrder + 1
                          }
                        })}
                      />
                    </Tooltip>
                  )
                }
                <Tooltip title={'Edit Category'}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={onEditCategoryClick}
                  />
                </Tooltip>
                <Tooltip title={'Add Task'}>
                  <Button
                    icon={<PlusSquareOutlined />}
                    onClick={onAddTaskClick}
                  />
                </Tooltip>
              </div>
            </Title>
            <Space style={{ marginBottom: '0.75em', fontSize: '0.8rem' }}>
              {category.description}
            </Space>
          </Space>
        }
      >
        {todoList.map((t: Todo, i) => (
          <div key={`todo_${t.id}`}>
            <TodoDropZone
              position={i}
              todoList={todoList}
              onSort={onSort}
              currentDate={currentDate}
            >
              <TodoItem
                todo={t}
                currentDate={currentDate}
                onAddProgress={onAdd}
                onComplete={onComplete}
              />
            </TodoDropZone>
          </div>
        ))}
        <TodoDropZone
          position={todoList.length}
          todoList={todoList}
          onSort={onSort}
          currentDate={currentDate}
        />
        <DragLayer />
      </Panel>
    </Collapse>
  )
}

export const CategoryCard = memo(_CategoryCard)
