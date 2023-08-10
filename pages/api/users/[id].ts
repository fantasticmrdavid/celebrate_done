// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'

export const getUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query

  if (!id)
    return res
      .status(500)
      .json({ message: 'Error: Invalid or no user ID defined.' })

  try {
    const result = await dbConnect
      .transaction()
      .query({
        sql: `SELECT
        uuid,
        username,
        email,
        firstname,
        surname
        FROM users WHERE uuid=? LIMIT 1`,
        values: [id],
      })
      .rollback((e: Error) => console.error(e))
      .commit()
    await dbConnect.end()
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.error('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET':
      return await getUser(req, res)
  }
}
