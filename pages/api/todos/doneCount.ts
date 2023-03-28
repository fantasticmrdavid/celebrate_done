import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import { TODO_STATUS } from '@/app/components/TodoItem/types'
import SqlString from 'sqlstring'

export type DoneTodoCount = {
  count: number
}

export const getDoneTodosCount = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { user_id, dateRangeStart, dateRangeEnd } = req.query
  try {
    const query = `SELECT COUNT(t.id) AS count
      FROM todos t
      LEFT JOIN todos_to_categories tc ON tc.todo_id = t.id
      WHERE 
      tc.user_id = ${SqlString.escape(user_id)} AND
      (
        t.status = "${TODO_STATUS.DONE}" 
        AND t.completedDateTime >= ${SqlString.escape(dateRangeStart)} 
        AND t.completedDateTime <= ${SqlString.escape(dateRangeEnd)}
      )`
    const results = await dbConnect.query(query)
    await dbConnect.end()
    return res.status(200).json((results as [count: number])[0])
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
      return await getDoneTodosCount(req, res)
  }
}
