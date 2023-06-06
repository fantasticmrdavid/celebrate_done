import { NextApiRequest, NextApiResponse } from 'next'
import {Todo, TODO_PRIORITY, TODO_STATUS} from '@/app/components/TodoItem/types'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'
import { dateIsoToSql } from '@/pages/api/utils'

export const updateTodos = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { action } = req.body
  let updateTodoQuery: string

  switch (action) {
    case 'complete': {
      const { id, status, completedDateTime } = req.body
      const completedDateTimeValue =
        status === TODO_STATUS.DONE
          ? `"${completedDateTime.slice(0, 19).replace('T', ' ')}"`
          : null
      updateTodoQuery = `UPDATE todos
           SET
            completedDateTime=${completedDateTimeValue},
            status="${status}"
            WHERE id=${id}`
      break
    }
    case 'togglePriority': {
      const { id, priority } = req.body
      updateTodoQuery = `UPDATE todos
           SET
            priority=${SqlString.escape(
              priority === TODO_PRIORITY.URGENT
                ? TODO_PRIORITY.NORMAL
                : TODO_PRIORITY.URGENT
            )}
            WHERE id=${id}`
      break
    }
    case 'updateSortOrder': {
      const { todoList } = req.body
      updateTodoQuery = `UPDATE todos
           SET
            sortOrder=(CASE id 
                ${todoList.map((t: Todo, i: number) => `WHEN ${t.id} THEN ${SqlString.escape(i)} `).join(" ")}
            END)
            WHERE id IN (${todoList.map((t: Todo) => t.id).join(",")})`
      break
    }
    case 'update': {
      const { id, name, startDate, notes, size, priority, category } = req.body
      updateTodoQuery = `
        UPDATE todos t
        INNER JOIN todos_to_categories tc ON (t.id = tc.todo_id)
           SET
            t.name=${SqlString.escape(name)},
            t.startDate=${SqlString.escape(dateIsoToSql(startDate))},
            t.notes=${
              notes && notes.trim().length > 0
                ? SqlString.escape(notes)
                : 'NULL'
            },
            t.size=${SqlString.escape(size)},
            t.priority=${SqlString.escape(priority)},
            tc.category_id=${SqlString.escape(category.uuid)}
            WHERE t.id=${id} AND tc.todo_id=${id}`
      break
    }
    default:
      updateTodoQuery = ''
  }

  try {
    const updateTodoResult = await dbConnect
      .transaction()
      .query(updateTodoQuery)
      .rollback((e: Error) => console.error(e))
      .commit()
    const result = updateTodoResult
    await dbConnect.end()
    return res.status(200).json(result)
  } catch (error) {
    console.error('SQL ERROR: ', error, updateTodoQuery)
    return res.status(500).json({ error })
  }
}
