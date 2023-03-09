import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import {
  Todo,
  TODO_PRIORITY,
  TODO_SIZE,
  TODO_STATUS,
} from '@/app/components/TodoItem/types'
import SqlString from 'sqlstring'

export type Get_Todos_Response = {
  id: number
  created: string
  startDate: string
  name: string
  description: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
  status: TODO_STATUS
  completedDateTime: string
  category_id: number
  category_name: string
  category_description: string
  category_maxPerDay: number
  category_sortOrder: number
}

export function mapTodosResponse(results: Get_Todos_Response[]): Todo[] {
  return results.map((r) => ({
    id: r.id,
    created: r.created,
    startDate: r.startDate,
    name: r.name,
    description: r.description,
    size: TODO_SIZE[r.size],
    priority: TODO_PRIORITY[r.priority],
    status: TODO_STATUS[r.status],
    completedDateTime: r.completedDateTime,
    category: {
      id: r.category_id,
      name: r.category_name,
      description: r.category_description,
      maxPerDay: r.category_maxPerDay,
      sortOrder: r.category_sortOrder,
    },
  }))
}

export const getTodos = async (req: NextApiRequest, res: NextApiResponse) => {
  const { date } = req.query
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
      WHERE (t.status != "${TODO_STATUS.DONE}" AND ${
        date ? SqlString.escape(date) : 'CURDATE()'
      } >= t.startDate) 
      OR (t.status = "${TODO_STATUS.DONE}" AND DATE(t.completedDateTime) = ${
        date ? SqlString.escape(date) : 'CURDATE()'
      })
      ORDER BY c.id, t.name DESC`
    )
    await dbConnect.end()
    return res
      .status(200)
      .json(mapTodosResponse(results as Get_Todos_Response[]))
  } catch (error) {
    return res.status(500).json({ error })
  }
}
