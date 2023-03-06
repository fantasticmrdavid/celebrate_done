import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import { TODO_STATUS } from '@/app/components/TodoItem/types'
import SqlString from 'sqlstring'

export const getTodos = async (req: NextApiRequest, res: NextApiResponse) => {
  const { date } = req.query
  console.log('DATE: ', date)
  try {
    const results = await dbConnect.query(
      `SELECT
        t.id,
        t.created,
        t.startDate,
        t.name,
        t.description,
        t.size,
        t.status,
        t.completedDateTime,
        c.id AS category_id,
        c.name AS category_name,
        c.description AS category_description
      FROM todos t
      LEFT JOIN todos_to_categories ON todos_to_categories.todo_id = t.id
      LEFT JOIN categories c ON todos_to_categories.category_id = c.id
      WHERE (t.status != "${TODO_STATUS.DONE}" AND ${
        date ? SqlString.escape(date) : 'CURDATE()'
      } >= t.startDate) 
      OR (t.status = "${TODO_STATUS.DONE}" AND DATE(t.completedDateTime) = ${
        date ? SqlString.escape(date) : 'CURDATE()'
      })
      ORDER BY c.id, t.name DESC`
    )
    await dbConnect.end()
    return res.status(200).json(results)
  } catch (error) {
    return res.status(500).json({ error })
  }
}
