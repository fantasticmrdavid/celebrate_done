import { NextApiRequest, NextApiResponse } from 'next'
import { TODO_STATUS } from '@/app/components/TodoItem/types'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'

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
    case 'update': {
      const { id, name, startDate, size, priority, category } = req.body
      updateTodoQuery = `
        UPDATE todos t
        INNER JOIN todos_to_categories tc ON (t.id = tc.todo_id)
           SET
            t.name=${SqlString.escape(name)},
            t.startDate=${SqlString.escape(startDate)},
            t.size=${SqlString.escape(size)},
            t.priority=${SqlString.escape(priority)},
            tc.category_id=${category.id}
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
      .rollback((e: any) => console.error(e))
      .commit()
    const result = updateTodoResult
    await dbConnect.end()
    return res.status(200).json(result)
  } catch (error) {
    console.error('SQL ERROR: ', error, updateTodoQuery)
    return res.status(500).json({ error })
  }
}
