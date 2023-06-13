import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'
import { Category } from '@/app/components/CategoryFormModal/types'

export const sortCategories = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { categoryList } = req.body
    const updateCategoriesQuery = `UPDATE categories
            SET
            sortOrder=(CASE uuid 
                ${categoryList
                  .map(
                    (c: Category, i: number) =>
                      `WHEN ${SqlString.escape(c.uuid)} THEN ${SqlString.escape(
                        i
                      )} `
                  )
                  .join(' ')}
            END)
            WHERE uuid IN (${categoryList
              .map((c: Category) => SqlString.escape(c.uuid))
              .join(',')})`
    const result = await dbConnect
      .transaction()
      .query(updateCategoriesQuery)
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
  res: NextApiResponse
) {
  switch (req.method) {
    case 'PATCH':
      return await sortCategories(req, res)
  }
}
