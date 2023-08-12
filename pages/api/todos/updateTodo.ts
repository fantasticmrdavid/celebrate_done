import { NextApiRequest, NextApiResponse } from 'next'
import { Todo } from '@/app/components/TodoItem/types'
import { TODO_PRIORITY, TODO_STATUS } from '@/app/components/TodoItem/utils'
import { dbConnect } from '@/config/dbConnect'
import { dateIsoToSql } from '@/pages/api/utils'

export const updateTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { user_id, uuid, name, isRecurring, repeats, action } = req.body
  let updateTodoQuery: { sql: string; values?: (string | number)[] }

  switch (action) {
    case 'complete': {
      const { uuid, status, completedDateTime } = req.body
      const completedDateTimeValue =
        status === TODO_STATUS.DONE
          ? `"${completedDateTime.slice(0, 19).replace('T', ' ')}"`
          : null
      updateTodoQuery = {
        sql: `UPDATE todos
           SET
            completedDateTime=${completedDateTimeValue},
            status="${status}"
            WHERE uuid=?`,
        values: [uuid],
      }
      break
    }
    case 'togglePriority': {
      const { uuid, priority } = req.body
      updateTodoQuery = {
        sql: `UPDATE todos
           SET
            priority=?
            WHERE uuid=?`,
        values: [
          priority === TODO_PRIORITY.URGENT
            ? TODO_PRIORITY.NORMAL
            : TODO_PRIORITY.URGENT,
          uuid,
        ],
      }
      break
    }
    case 'updateSortOrder': {
      const { todoList } = req.body
      updateTodoQuery = {
        sql: `UPDATE todos
           SET
            sortOrder=(CASE uuid 
                ${todoList.map(() => `WHEN ? THEN ? `).join(' ')}
            END)
            WHERE uuid IN (${todoList.map(() => '?').join(',')})`,
        values: [
          ...todoList.flatMap((t: Todo, i: number) => [t.uuid, i]),
          ...todoList.map((t: Todo) => t.uuid),
        ],
      }
      break
    }
    case 'update': {
      const { uuid, name, startDate, notes, size, priority, category } =
        req.body
      updateTodoQuery = {
        sql: `
        UPDATE todos t
        INNER JOIN todos_to_categories tc ON (t.uuid = tc.todo_uuid)
           SET
            t.name=?,
            t.startDate=?,
            t.notes=?,
            t.size=?,
            t.priority=?,
            tc.category_id=?,
            tc.todo_uuid=?
            WHERE t.uuid=?
            AND tc.todo_uuid=?`,
        values: [
          name,
          dateIsoToSql(startDate),
          notes && notes.trim().length > 0 ? notes : null,
          size,
          priority,
          category.uuid,
          uuid,
          uuid,
          uuid,
        ],
      }
      break
    }
    default:
      updateTodoQuery = { sql: '' }
  }

  try {
    const updateTodoResult = await dbConnect
      .transaction()
      .query(updateTodoQuery)
      .query({
        sql: `SELECT todo_id FROM schedules WHERE todo_id=? LIMIT 1`,
        values: [uuid],
      })
      .query((r: never[]) => {
        const scheduleExists = r.length > 0
        if (action !== 'update') return null
        if (!isRecurring && scheduleExists)
          return [`DELETE FROM schedules WHERE todo_id=?`, [uuid]]
        if (isRecurring && scheduleExists)
          return [
            `UPDATE schedules 
              SET 
                unit=?,
                name=?
            WHERE todo_id=? LIMIT 1`,
            [repeats, name, uuid],
          ]

        if (isRecurring && !scheduleExists)
          return [
            `INSERT into schedules VALUES(null,?,?,?,1,?)`,
            [user_id, uuid, name.trim(), repeats],
          ]

        return null
      })
      .rollback((e: Error) => console.error(e))
      .commit()
    await dbConnect.end()
    return res.status(200).json(updateTodoResult)
  } catch (error) {
    console.error('SQL ERROR: ', error, updateTodoQuery)
    return res.status(500).json({ error })
  }
}
