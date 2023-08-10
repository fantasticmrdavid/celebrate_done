// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import { Category } from '@/app/components/CategoryFormModal/types'

type Get_Categories_Response = {
  uuid: string
  name: string
  description: string
  maxPerDay: number
  sortOrder: number
  user_uuid: string
  color: string
}

export function mapCategoryResponse(
  results: Get_Categories_Response[],
): Category[] {
  return results.map((r, i) => ({
    uuid: r.uuid,
    name: r.name,
    description: r.description,
    maxPerDay: r.maxPerDay,
    sortOrder: i,
    user_id: r.user_uuid,
    color: r.color,
  }))
}

export const getCategories = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { user_id } = req.query
    const query = `SELECT
        uuid,
        name,
        description,
        maxPerDay,
        sortOrder,
        user_uuid,
        color
      FROM categories
      WHERE user_uuid = ?
      ORDER BY sortOrder, name ASC`
    const results = await dbConnect.query({ sql: query, values: [user_id] })
    await dbConnect.end()
    return res
      .status(200)
      .json(mapCategoryResponse(results as Get_Categories_Response[]))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}
