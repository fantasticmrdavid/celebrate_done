import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'

export const getTodos = async (req: NextApiRequest, res: NextApiResponse) => {
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
      ORDER BY c.id, t.name DESC`
    )
    await dbConnect.end()
    return res.status(200).json(results || [])
  } catch (error) {
    return res.status(500).json({ error })
  }
}
