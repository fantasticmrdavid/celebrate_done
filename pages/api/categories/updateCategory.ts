import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'

export const updateCategory = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { uuid, name, description, maxPerDay, sortOrder } = req.body
    const updateCategoryQuery = `UPDATE categories
            SET
            name=${SqlString.escape(name)},
            description=${SqlString.escape(description)},
            maxPerDay=${maxPerDay},
            sortOrder=${sortOrder}
            WHERE uuid=${SqlString.escape(uuid)}
            LIMIT 1
            `
    try {
      const result = await dbConnect
        .transaction()
        .query(updateCategoryQuery)
        .rollback((e: any) => console.error(e))
        .commit()
      await dbConnect.end()
      return res.status(200).json(result)
    } catch (e) {
      throw e
    }
  } catch (error) {
    console.log('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}
