import { NextApiRequest, NextApiResponse } from 'next'
import { TODO_STATUS } from '@/app/components/TodoItem/types'
import { dbConnect } from '@/config/dbConnect'
import SqlString from "sqlstring";

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
      const { id, name, startDate, size, category } = req.body
      updateTodoQuery = `UPDATE todos
           SET
            name=${SqlString.escape(name)},
            startDate=${SqlString.escape(startDate)},
            size=${SqlString.escape(size)},
            WHERE id=${id}`
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
