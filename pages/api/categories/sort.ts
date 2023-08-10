import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import { Category } from '@/app/components/CategoryFormModal/types'

export const sortCategories = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { categoryList } = req.body
    const updateCategoriesQuery = `UPDATE categories
            SET
            sortOrder=(CASE uuid 
                ${categoryList.map(() => `WHEN ? THEN ? `).join(' ')}
            END)
            WHERE uuid IN (${categoryList.map(() => '?').join(',')})`
    const result = await dbConnect
      .transaction()
      .query({
        sql: updateCategoriesQuery,
        values: [
          ...categoryList.flatMap((c: Category, i: number) => [c.uuid, i]),
          ...categoryList.map((c: Category) => c.uuid),
        ],
      })
      .rollback((e: Error) => console.error(e))
      .commit()
    await dbConnect.end()
    return res.status(200).json(result)
  } catch (error) {
    console.log('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'PATCH':
      return await sortCategories(req, res)
  }
}
