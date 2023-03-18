import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import { TODO_PRIORITY, TODO_STATUS } from '@/app/components/TodoItem/types'
import SqlString from 'sqlstring'
import dayjs from 'dayjs'
import { Get_Todos_Response, mapTodosResponse } from './getTodos'

export const getDoneTodos = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { date } = req.query
  const localStartOfDay = date
    ? dayjs(new Date(date as string))
        .startOf('day')
        .toISOString()
    : dayjs(new Date()).startOf('day').toISOString()
  try {
    const results = await dbConnect.query(
      `SELECT
        t.id,
        t.created,
        t.startDate,
        t.name,
        t.description,
        t.size,
        t.priority,
        t.status,
        t.completedDateTime,
        c.id AS category_id,
        c.name AS category_name,
        c.description AS category_description,
        c.maxPerDay AS category_maxPerDay,
        c.sortOrder AS category_sortOrder
      FROM todos t
      LEFT JOIN todos_to_categories ON todos_to_categories.todo_id = t.id
      LEFT JOIN categories c ON todos_to_categories.category_id = c.id
      WHERE t.status = "${
        TODO_STATUS.DONE
      }" AND DATE(t.completedDateTime) <= ${SqlString.escape(
        date ? date : new Date().toISOString()
      )} AND DATE(t.completedDateTime) >= ${SqlString.escape(localStartOfDay)}
      ORDER BY
        (t.priority = "${TODO_PRIORITY.URGENT}") DESC,
        c.id, t.name ASC`
    )
    await dbConnect.end()
    return res
      .status(200)
      .json(mapTodosResponse(results as Get_Todos_Response[]))
  } catch (error) {
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return await getDoneTodos(req, res)
  }
}
