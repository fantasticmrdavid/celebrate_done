// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'

export const getUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const results = await dbConnect.query(
      'SELECT uuid, username, email, firstname, surname FROM users'
    )
    await dbConnect.end()
    return res.status(200).json(results)
  } catch (error) {
    return res.status(500).json({ error })
  }
}
