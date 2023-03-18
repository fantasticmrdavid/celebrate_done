// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'

export const getCategories = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const results = await dbConnect.query(
      'SELECT id, name, description, maxPerDay, sortOrder FROM categories ORDER BY sortOrder, name'
    )
    await dbConnect.end()
    return res.status(200).json(results)
  } catch (error) {
    return res.status(500).json({ error })
  }
}
