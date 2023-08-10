import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'

export const updateCategory = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { uuid, name, description, maxPerDay, sortOrder, color } = req.body
    const updateCategoryQuery = `UPDATE categories
            SET
              name=?,
              description=?,
              maxPerDay=?,
              sortOrder=?,
              color=?
            WHERE uuid=?
            LIMIT 1
            `
    const result = await dbConnect
      .transaction()
      .query({
        sql: updateCategoryQuery,
        values: [
          name.trim(),
          description.trim(),
          maxPerDay || null,
          sortOrder,
          color,
          uuid,
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
