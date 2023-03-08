import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'

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
      .query(`DELETE FROM todos WHERE id=${parseInt(id as string)} LIMIT 1`)
      .rollback((e: any) => console.error(e))
      .commit()
    const result = deleteTodoResult
    await dbConnect.end()
    return res.status(200).json(result)
  } catch (error) {
    console.error('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case 'DELETE':
      return await deleteTodo(req, res)
  }
}
