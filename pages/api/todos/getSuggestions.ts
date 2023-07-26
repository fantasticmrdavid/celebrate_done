import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'

export type Get_Suggestions_Response = {
  name: string
  count: number
}

export const getSuggestions = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { user_id } = req.query
  if (!user_id || user_id.length === 0) return {}
  try {
    const query = `SELECT DISTINCT t.name
        FROM todos t
        LEFT JOIN todos_to_categories tc ON tc.todo_id = t.id
        WHERE tc.user_id = ${SqlString.escape(user_id)}`
    const results = await dbConnect.query(query)
    await dbConnect.end()
    return res.status(200).json(results as Get_Suggestions_Response[])
  } catch (error) {
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET':
      return await getSuggestions(req, res)
  }
}
