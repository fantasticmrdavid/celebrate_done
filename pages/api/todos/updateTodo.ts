import { NextApiRequest, NextApiResponse } from 'next'
import { Todo } from '@/app/components/TodoItem/types'
import { TODO_PRIORITY, TODO_STATUS } from '@/app/components/TodoItem/utils'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'
import { dateIsoToSql } from '@/pages/api/utils'

export const updateTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { user_id, uuid, name, isRecurring, repeats, action } = req.body
  let updateTodoQuery: string

  switch (action) {
    case 'complete': {
      const { uuid, status, completedDateTime } = req.body
      const completedDateTimeValue =
        status === TODO_STATUS.DONE
          ? `"${completedDateTime.slice(0, 19).replace('T', ' ')}"`
          : null
      updateTodoQuery = `UPDATE todos
           SET
            completedDateTime=${completedDateTimeValue},
            status="${status}"
            WHERE uuid=${SqlString.escape(uuid)}`
      break
    }
    case 'togglePriority': {
      const { uuid, priority } = req.body
      updateTodoQuery = `UPDATE todos
           SET
            priority=${SqlString.escape(
              priority === TODO_PRIORITY.URGENT
                ? TODO_PRIORITY.NORMAL
                : TODO_PRIORITY.URGENT,
            )}
            WHERE uuid=${SqlString.escape(uuid)}`
      break
    }
    case 'updateSortOrder': {
      const { todoList } = req.body
      updateTodoQuery = `UPDATE todos
           SET
            sortOrder=(CASE uuid 
                ${todoList
                  .map(
                    (t: Todo, i: number) =>
                      `WHEN ${SqlString.escape(t.uuid)} THEN ${SqlString.escape(
                        i,
                      )} `,
                  )
                  .join(' ')}
            END)
            WHERE uuid IN (${todoList
              .map((t: Todo) => SqlString.escape(t.uuid))
              .join(',')})`
      break
    }
    case 'update': {
      const { uuid, name, startDate, notes, size, priority, category } =
        req.body
      updateTodoQuery = `
        UPDATE todos t
        INNER JOIN todos_to_categories tc ON (t.uuid = tc.todo_uuid)
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
            tc.category_id=${SqlString.escape(category.uuid)},
            tc.todo_uuid=${SqlString.escape(uuid)}
            WHERE t.uuid=${SqlString.escape(
              uuid,
            )} AND tc.todo_uuid=${SqlString.escape(uuid)}`
      break
    }
    default:
      updateTodoQuery = ''
  }

  try {
    const updateTodoResult = await dbConnect
      .transaction()
      .query(updateTodoQuery)
      .query(
        `SELECT todo_id FROM schedules WHERE todo_id=${SqlString.escape(
          uuid,
        )} LIMIT 1`,
      )
      .query((r: never[]) => {
        const scheduleExists = r.length > 0
        if (action !== 'update') return null
        if (!isRecurring && scheduleExists)
          return [
            `DELETE FROM schedules WHERE todo_id=${SqlString.escape(uuid)}`,
          ]
        if (isRecurring && scheduleExists)
          return [
            `UPDATE schedules 
              SET 
                unit=${SqlString.escape(repeats)},
                name=${SqlString.escape(name)}
            WHERE todo_id=${SqlString.escape(uuid)} LIMIT 1`,
          ]

        if (isRecurring && !scheduleExists)
          return [
            `INSERT into schedules VALUES(
              null,
              ${SqlString.escape(user_id)},
              ${SqlString.escape(uuid)},
              ${SqlString.escape(name.trim())},
              1,
              ${SqlString.escape(repeats)})`,
          ]

        return null
      })
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
