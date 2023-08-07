import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import { TODO_PRIORITY, TODO_STATUS } from '@/app/components/TodoItem/utils'
import SqlString from 'sqlstring'
import {
  Get_Todos_Response,
  mapTodosResponse,
} from '@/pages/api/todos/getTodos'

export const getFutureTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { user_id, dateRangeStart, dateRangeEnd } = req.query
  if (!user_id) return {}

  try {
    const query = `SELECT
        t.id,
        t.created,
        t.startDate,
        t.name,
        t.notes,
        t.size,
        t.priority,
        t.status,
        t.completedDateTime,
        c.id AS category_id,
        c.name AS category_name,
        c.uuid AS category_uuid,
        c.description AS category_description,
        c.maxPerDay AS category_maxPerDay,
        c.sortOrder AS category_sortOrder,
        c.user_uuid AS category_user_uuid
      FROM todos t
      LEFT JOIN todos_to_categories tc ON tc.todo_uuid = t.uuid
      LEFT JOIN categories c ON tc.category_id = c.uuid
      WHERE
      c.user_uuid = ${SqlString.escape(user_id)} AND
      (
        t.status != "${TODO_STATUS.DONE}" 
        AND t.startDate >= ${SqlString.escape(dateRangeStart)} 
        AND t.startDate <= ${SqlString.escape(dateRangeEnd)}
      )
      ORDER BY
        t.startDate ASC,
        (t.priority = "${TODO_PRIORITY.URGENT}") DESC,
        c.name, t.name ASC`
    const results = await dbConnect.query(query)
    await dbConnect.end()
    return res
      .status(200)
      .json(mapTodosResponse(results as Get_Todos_Response[]))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET':
      return await getFutureTodos(req, res)
  }
}
