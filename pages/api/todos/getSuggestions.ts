import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'

export type Get_Suggestions_Response = {
  name: string
  count: number
}

export const getSuggestions = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const query = `SELECT name, COUNT(*) count
        FROM todos
        GROUP BY name HAVING COUNT(*) > 1`
    const results = await dbConnect.query(query)
    await dbConnect.end()
    return res.status(200).json(results as Get_Suggestions_Response[])
  } catch (error) {
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return await getSuggestions(req, res)
  }
}
