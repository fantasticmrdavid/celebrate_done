import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import { TODO_PRIORITY, TODO_STATUS } from '@/app/components/TodoItem/types'
import SqlString from 'sqlstring'
import { Get_Todos_Response, mapTodosResponse } from './getTodos'

export const getDoneTodos = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { user_id, localStartOfDay, localEndOfDay } = req.query
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
      LEFT JOIN todos_to_categories tc ON tc.todo_id = t.id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE 
      tc.user_id = ${SqlString.escape(user_id)} AND
      (
        t.status = "${TODO_STATUS.DONE}" 
        AND t.completedDateTime <= ${SqlString.escape(localEndOfDay)} 
        AND t.completedDateTime >= ${SqlString.escape(localStartOfDay)}
      )
      ORDER BY
        (t.priority = "${TODO_PRIORITY.URGENT}") DESC,
        c.name, t.name ASC`
    )
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
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return await getDoneTodos(req, res)
  }
}
