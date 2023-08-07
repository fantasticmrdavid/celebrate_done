import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'

type Data = {
  name: string
}

export const deleteTodo = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query

  if (!id)
    return res
      .status(500)
      .json({ message: 'Error: Invalid or no ID defined for deletion.' })

  try {
    const deleteTodoResult = await dbConnect
      .transaction()
      .query(
        `DELETE t, tc
        FROM todos t
        JOIN todos_to_categories tc ON tc.todo_uuid = t.uuid
        WHERE t.uuid=${SqlString.escape(id)}`,
      )
      .query(`DELETE FROM schedules WHERE todo_id=${SqlString.escape(id)}`)
      .rollback((e: Error) => console.error(e))
      .commit()
    await dbConnect.end()
    return res.status(200).json(deleteTodoResult)
  } catch (error) {
    console.error('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  switch (req.method) {
    case 'DELETE':
      return await deleteTodo(req, res)
  }
}
