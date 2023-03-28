import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import {
  TODO_PRIORITY,
  TODO_SIZE,
  TODO_STATUS,
} from '@/app/components/TodoItem/types'
import SqlString from 'sqlstring'

export type Get_Done_Todos_Response = {
  id: number
  name: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
  count: number
}

export type DoneTodo = {
  id: number
  name: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
  count: number
}

export function mapDoneTodosResponse(
  results: Get_Done_Todos_Response[]
): DoneTodo[] {
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    size: TODO_SIZE[r.size],
    priority: TODO_PRIORITY[r.priority],
    count: r.count,
  }))
}

export const getDoneTodos = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { user_id, dateRangeStart, dateRangeEnd } = req.query
  try {
    const query = `SELECT
        MAX(t.id) AS id,
        t.name,
        MAX(t.size) AS size,
        MAX(t.priority) AS priority,
        MAX(c.name) AS category_name,
        MAX(c.sortOrder) AS category_sortOrder,
        COUNT(*) AS count
      FROM todos t
      LEFT JOIN todos_to_categories tc ON tc.todo_id = t.id
      LEFT JOIN categories c ON tc.category_id = c.id
      WHERE 
      tc.user_id = ${SqlString.escape(user_id)} AND
      (
        t.status = "${TODO_STATUS.DONE}" 
        AND t.completedDateTime >= ${SqlString.escape(dateRangeStart)} 
        AND t.completedDateTime <= ${SqlString.escape(dateRangeEnd)}
      )
      GROUP BY t.name
      ORDER BY count DESC`
    const results = await dbConnect.query(query)
    await dbConnect.end()
    return res
      .status(200)
      .json(mapDoneTodosResponse(results as Get_Done_Todos_Response[]))
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
