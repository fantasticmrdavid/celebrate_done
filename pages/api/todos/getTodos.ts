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
  notes: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
  status: TODO_STATUS
  completedDateTime: string
  sortOrder: number
  category_id: number
  category_uuid: string
  category_name: string
  category_description: string
  category_color: string
  category_maxPerDay: number
  category_sortOrder: number
  category_user_uuid: string
}

export function mapTodosResponse(results: Get_Todos_Response[]): Todo[] {
  return results.map((r, i) => ({
    id: r.id,
    created: r.created,
    startDate: r.startDate,
    name: r.name,
    notes: r.notes,
    size: TODO_SIZE[r.size],
    priority: TODO_PRIORITY[r.priority],
    status: TODO_STATUS[r.status],
    completedDateTime: r.completedDateTime,
    sortOrder: i,
    category: {
      uuid: r.category_uuid,
      name: r.category_name,
      description: r.category_description,
      color: r.category_color,
      maxPerDay: r.category_maxPerDay,
      sortOrder: r.category_sortOrder,
      user_id: r.category_user_uuid,
    },
  }))
}

export const getTodos = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user_id, localStartOfDay, localEndOfDay } = req.query
  if (!user_id || user_id.length === 0) return {}

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
        t.sortOrder,
        c.id AS category_id,
        c.name AS category_name,
        c.uuid AS category_uuid,
        c.description AS category_description,
        c.color AS category_color,
        c.maxPerDay AS category_maxPerDay,
        c.sortOrder AS category_sortOrder,
        c.user_uuid AS category_user_uuid
      FROM todos t
      LEFT JOIN todos_to_categories tc ON tc.todo_id = t.id
      LEFT JOIN categories c ON tc.category_id = c.uuid
      WHERE
      c.user_uuid = ${SqlString.escape(user_id)} AND
      (
        (
            t.status != "${TODO_STATUS.DONE}" AND
           ${SqlString.escape(localStartOfDay)} >= t.startDate
           ) OR
        (
          t.status = "${TODO_STATUS.DONE}" 
          AND t.completedDateTime >= ${SqlString.escape(localStartOfDay)}
          AND t.completedDateTime <= ${SqlString.escape(localEndOfDay)} 
        )
      )
      ORDER BY
        (t.status = "${TODO_STATUS.INCOMPLETE}") DESC,
        (t.priority = "${TODO_PRIORITY.URGENT}") DESC,
        (t.sortOrder) ASC,
        t.id, c.name, t.name ASC`
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
