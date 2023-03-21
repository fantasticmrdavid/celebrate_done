// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'

export const getCategories = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { user_id } = req.query
    const query = `SELECT
        DISTINCT c.uuid,
        c.name,
        c.description,
        c.maxPerDay,
        c.sortOrder,
        tc.user_id
      FROM categories c
      LEFT JOIN todos_to_categories tc ON tc.category_id = c.uuid
      WHERE tc.user_id = ${SqlString.escape(user_id)}
      ORDER BY sortOrder, name`
    const results = await dbConnect.query(query)
    await dbConnect.end()
    return res.status(200).json(results)
  } catch (error) {
    return res.status(500).json({ error })
  }
}
