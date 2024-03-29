import React, { useContext, useState } from 'react'
import {
  AutoComplete,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
} from 'antd'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { CategoriesContext } from '@/app/contexts/Categories'
import { EditOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { getLocalStartOfDay } from '@/app/utils'

import { TodoValidation, validateTodo } from './utils'
import { ValidationMessage } from '@/app/components/ValidationMessage/ValidationMessage'
import { SelectedDateContext } from '@/app/contexts/SelectedDate'
import { TodoWithRelationsNoCategory } from '@/pages/api/todos/getTodos'
import {
  Category,
  Schedule,
  Todo,
  TodoPriority,
  TodoRepeatFrequency,
  TodoSize,
} from '@prisma/client'
import { CategoryWithRelations } from '@/pages/api/categories/getCategories'
import { toast } from 'react-toastify'
import styles from './todoFormModal.module.scss'

type TodoFormModalProps = {
  isOpen: boolean
  onCancel?: () => void
  category?: Category
  schedule?: Schedule | null
  mode: TodoModal_Mode
  todo?: TodoWithRelationsNoCategory
}

export enum TodoModal_Mode {
  ADD = 'ADD',
  EDIT = 'EDIT',
}

const sizeList = [
  {
    label: 'Small',
    value: TodoSize.SMALL,
  },
  {
    label: 'Medium',
    value: TodoSize.MEDIUM,
  },
  {
    label: 'Large',
    value: TodoSize.LARGE,
  },
]

const priorityList = [
  {
    label: 'Normal',
    value: TodoPriority.NORMAL,
  },
  {
    label: 'Urgent',
    value: TodoPriority.URGENT,
  },
]

const { Option } = Select

export const TodoFormFormModal = (props: TodoFormModalProps) => {
  const { currentDate } = useContext(SelectedDateContext)
  const {
    isOpen,
    onCancel,
    category: propsCategory,
    todo,
    schedule,
    mode,
  } = props
  const [name, setName] = useState<string>(todo ? todo.name : '')
  const [startDate, setStartDate] = useState<string>(
    todo
      ? dayjs(new Date(todo.startDate)).startOf('day').toISOString()
      : dayjs(new Date(currentDate)).startOf('day').toISOString(),
  )
  const [notes, setNotes] = useState<string | null>(todo ? todo.notes : '')
  const [size, setSize] = useState<TodoSize>(todo ? todo.size : TodoSize.SMALL)
  const [priority, setPriority] = useState<TodoPriority>(
    todo ? todo.priority : TodoPriority.NORMAL,
  )
  const [category, setCategory] = useState<Category | undefined>(propsCategory)

  const [isRecurring, setIsRecurring] = useState(!!schedule || false)
  const [repeats, setRepeats] = useState<TodoRepeatFrequency>(
    todo && todo.schedule ? todo.schedule.unit : TodoRepeatFrequency.DAILY,
  )

  const [validation, setValidation] = useState<TodoValidation>({})

  const { data: suggestionList } = useQuery({
    queryKey: ['getTodoSuggestions'],
    queryFn: async () =>
      await fetch(`/api/todos/getSuggestions`).then((res) => res.json()),
    initialData: [],
  })

  const queryClient = useQueryClient()

  const { categoryList, isFetchingCategories, isFetchingCategoriesError } =
    useContext(CategoriesContext)

  const categoryTodoList =
    categoryList.find((c) => c.id === category?.id)?.todos || []

  const createTodo = useMutation({
    mutationFn: () =>
      axios.post('/api/todos', {
        name,
        startDate: getLocalStartOfDay(startDate),
        notes,
        size,
        priority,
        category,
        isRecurring,
        repeats,
        sortOrder:
          categoryTodoList.length > 0
            ? Math.max(...categoryTodoList.map((t: Todo) => t.sortOrder)) + 1
            : 0,
      }),
    onMutate: async () => {
      const previousCategoriesList = queryClient.getQueryData([
        'getCategories',
        currentDate,
      ]) as CategoryWithRelations[]

      const updatedCategoriesList = previousCategoriesList.map((c) =>
        c.id === category?.id
          ? {
              ...c,
              todos: [
                {
                  name,
                  startDate: getLocalStartOfDay(startDate),
                  notes,
                  size,
                  priority,
                  category,
                  isRecurring,
                  repeats,
                  sortOrder:
                    Math.max(...(c.todos.map((t) => t.sortOrder) || [0])) + 1,
                  id: `temp_newID`,
                },
                ...c.todos,
              ],
            }
          : c,
      )

      queryClient.setQueryData(
        ['getCategories', currentDate],
        updatedCategoriesList,
      )
      if (onCancel) onCancel()
      return { previousCategoriesList }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getCategories', currentDate],
      })
      queryClient.invalidateQueries({ queryKey: ['generateScheduledTodos'] })
      toast.success(
        <>
          <strong>{name}</strong> added to <strong>{category?.name}</strong>!
        </>,
        {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'colored',
        },
      )
      setName('')
      // if (onCancel && name === todo?.name) onCancel()
    },
    onError: (error) => {
      console.log('ERROR: ', error)
      toast.error(<>Error adding Todo. Check console for details.</>, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'colored',
      })
    },
  })

  const saveTodo = useMutation({
    mutationFn: () =>
      axios.patch('/api/todos', {
        id: todo?.id,
        name,
        startDate: getLocalStartOfDay(startDate),
        notes,
        size,
        priority,
        category,
        isRecurring,
        repeats,
        schedule,
        action: 'update',
      }),
    onMutate: async () => {
      const previousCategoriesList = queryClient.getQueryData([
        'getCategories',
        currentDate,
      ]) as CategoryWithRelations[]
      const updatedCategoriesList = previousCategoriesList.map((c) =>
        c.id === category?.id
          ? {
              ...c,
              todos: c.todos.map((t) =>
                t.id === todo?.id
                  ? {
                      ...t,
                      name,
                      startDate: getLocalStartOfDay(startDate),
                      notes,
                      size,
                      priority,
                      schedule: isRecurring
                        ? {
                            count: 1,
                            unit: repeats,
                          }
                        : undefined,
                    }
                  : t,
              ),
            }
          : c,
      )

      queryClient.setQueryData(
        ['getCategories', currentDate],
        updatedCategoriesList,
      )
      return { previousCategoriesList }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getCategories', currentDate],
      })
      queryClient.invalidateQueries({ queryKey: ['generateScheduledTodos'] })
      toast.success(
        <>
          <strong>{name}</strong> updated!
        </>,
        {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'colored',
        },
      )
      if (onCancel) onCancel()
    },
    onError: (error) => {
      console.log('ERROR: ', error)
      toast.error(<>Error saving todo. Check console for details.</>, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'colored',
      })
    },
  })

  if (isFetchingCategoriesError) return <div>ERROR LOADING CATEGORIES...</div>

  const isLoading =
    createTodo.status === 'pending' || saveTodo.status === 'pending'
  const getOkButtonLabel = () => {
    if (isLoading) return mode === TodoModal_Mode.ADD ? 'Adding Task' : 'Saving'
    return mode === TodoModal_Mode.ADD ? 'Add Task' : 'Save'
  }

  return (
    <Modal
      title={
        <>
          {mode === TodoModal_Mode.ADD ? (
            <>
              <PlusSquareOutlined /> Add Task
            </>
          ) : (
            <>
              <EditOutlined /> Edit Task
            </>
          )}
        </>
      }
      open={isOpen}
      onCancel={onCancel}
      onOk={() => {
        const validation = validateTodo({
          name,
        })
        if (Object.keys(validation).length > 0) return setValidation(validation)
        return mode === TodoModal_Mode.ADD
          ? createTodo.mutate()
          : saveTodo.mutate()
      }}
      okText={getOkButtonLabel()}
      okButtonProps={{
        loading: isLoading,
        disabled: isLoading,
      }}
    >
      <Space style={{ padding: '1em', width: '100%' }} direction={'vertical'}>
        <Form.Item label={'Name'} className={styles.formItem}>
          <AutoComplete
            options={suggestionList.map((s: { name: string }) => ({
              value: s.name,
            }))}
            filterOption={(inputValue, option) => {
              return (
                (option?.value as string)
                  .toUpperCase()
                  .indexOf(inputValue.toUpperCase()) !== -1
              )
            }}
            status={validation.name ? 'error' : undefined}
            defaultValue={name}
            placeholder={'Enter the name for the task'}
            onChange={(val) => setName(val)}
          />
          {validation.name && <ValidationMessage message={validation.name} />}
        </Form.Item>
        <Form.Item label={'Size'} className={styles.formItem}>
          <Radio.Group
            value={size}
            options={sizeList}
            buttonStyle={'solid'}
            optionType={'button'}
            onChange={(e) => setSize(e.target.value)}
          />
        </Form.Item>
        <Form.Item label={'Priority'} className={styles.formItem}>
          <Radio.Group
            value={priority}
            options={priorityList}
            buttonStyle={'solid'}
            optionType={'button'}
            onChange={(e) => setPriority(e.target.value)}
          />
        </Form.Item>
        <Form.Item label={'Category'} className={styles.formItem}>
          <Select
            defaultValue={isFetchingCategories ? undefined : category?.id}
            disabled={isFetchingCategories}
            onChange={(value) =>
              setCategory(categoryList.find((c) => c.id === value))
            }
            placeholder={
              isFetchingCategories
                ? 'Loading categories...'
                : 'Select a category for the task'
            }
            allowClear={false}
          >
            {categoryList.map((c) => (
              <Option key={`category_${c.id}`} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={'Is visible from'} className={styles.formItem}>
          <DatePicker
            value={dayjs(new Date(startDate))}
            allowClear={false}
            onChange={(_, dateString) =>
              setStartDate(getLocalStartOfDay(dateString as string))
            }
          />
        </Form.Item>
        <Form.Item label={'Recurring Task'} className={styles.formItem}>
          <Radio.Group
            value={isRecurring}
            options={[
              {
                label: 'Yes',
                value: true,
              },
              {
                label: 'No',
                value: false,
              },
            ]}
            buttonStyle={'solid'}
            optionType={'button'}
            onChange={(e) => setIsRecurring(e.target.value)}
          />
        </Form.Item>
        {isRecurring && (
          <Form.Item label={'Repeat'} className={styles.formItem}>
            <div
              style={{
                display: 'grid',
                gap: '0.5em',
                alignItems: 'center',
                gridTemplateColumns: 'auto auto 1fr',
              }}
            >
              <Select
                defaultValue={repeats}
                onChange={(value) => setRepeats(value)}
                allowClear={false}
                popupMatchSelectWidth={false}
              >
                {Object.values(TodoRepeatFrequency).map((r) => (
                  <Option key={`recurringDateType_${r}`} value={r}>
                    {r}
                  </Option>
                ))}
              </Select>{' '}
              after completion
            </div>
          </Form.Item>
        )}
        <Form.Item label={'Notes'} className={styles.formItem}>
          <Input.TextArea
            placeholder={'Add any notes (optional)'}
            value={notes || ''}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Form.Item>
      </Space>
    </Modal>
  )
}

export default TodoFormFormModal
