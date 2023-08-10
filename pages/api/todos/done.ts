import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import {
  TODO_PRIORITY,
  TODO_SIZE,
  TODO_STATUS,
} from '@/app/components/TodoItem/utils'

import SqlString from 'sqlstring'

export type Get_Done_Todos_Response = {
  id: number
  name: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
  count: number
  category_name: string
  category_sortOrder: string
}

export type DoneTodo = {
  id: number
  name: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
  count: number
  category: {
    name: string
    sortOrder: number
  }
}

export function mapDoneTodosResponse(
  results: Get_Done_Todos_Response[],
): DoneTodo[] {
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    size: TODO_SIZE[r.size],
    priority: TODO_PRIORITY[r.priority],
    count: r.count,
    category: {
      name: r.category_name,
      sortOrder: parseInt(r.category_sortOrder),
    },
  }))
}

export const getDoneTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
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
      LEFT JOIN todos_to_categories tc ON tc.todo_uuid = t.uuid
      LEFT JOIN categories c ON tc.category_id = c.uuid
      WHERE 
      tc.user_id = ? AND
      (
        t.status = "${TODO_STATUS.DONE}" 
        AND t.completedDateTime >= ? 
        AND t.completedDateTime <= ?
      )
      GROUP BY t.name, size, c.name
      ORDER BY
      c.name,
      (size = ${SqlString.escape(TODO_SIZE.LARGE)}) DESC,
      (size = ${SqlString.escape(TODO_SIZE.MEDIUM)}) DESC, 
      count DESC`
    const results = await dbConnect.query({
      sql: query,
      values: [user_id, dateRangeStart, dateRangeEnd],
    })
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
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET':
      return await getDoneTodos(req, res)
  }
}
