import React, {memo} from "react"
import {Todo, TODO_STATUS} from "@/app/components/TodoItem/types";
import {Button, Collapse, Space, Tooltip, Typography} from "antd";
import styles from "./categoryCard.module.scss";
import {EditOutlined, PlusSquareOutlined} from "@ant-design/icons";
import {TodoDropZone} from "@/app/components/TodoDropZone/TodoDropZone";
import {TodoItem} from "@/app/components/TodoItem/Todo";
import {Category} from "@/app/components/CategoryFormModal/types";
import {DragLayer} from "@/app/components/CategoryCard/DragLayer";

const { Panel } = Collapse
const { Title } = Typography

type Props = {
  category: Category,
  todoList: Todo[],
  currentDate: string,
  onAddTaskClick: () => void
  onEditCategoryClick: () => void
  onSort: (tList: Todo[]) => any
}

export const _CategoryCard = ({
  todoList,
  category,
  currentDate,
  onAddTaskClick,
  onEditCategoryClick,
  onSort
}: Props) => {
  const doneCount = todoList.filter(
    (t) => t.status === TODO_STATUS.DONE
  )?.length

  return (
    <Collapse
      activeKey={todoList.length > 0 ? [category.uuid] : []}
      key={`category_${category.uuid}`}
      collapsible="icon"
      expandIconPosition={'end'}
      defaultActiveKey={category.uuid}
      size={'small'}
    >
      <Panel
        key={category.uuid}
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
            <Space
              style={{ marginBottom: '0.75em', fontSize: '0.8rem' }}
            >
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