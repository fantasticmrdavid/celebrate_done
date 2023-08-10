import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import { v4 as uuidv4 } from 'uuid'

export const addCategory = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { name, description, maxPerDay, user_id, color } = req.body
    const insertCategoryQuery = `INSERT into categories
            VALUES (null, ?, ?, ?, ?, ?, 0, ?)`
    const result = await dbConnect
      .transaction()
      .query({
        sql: insertCategoryQuery,
        values: [
          uuidv4(),
          user_id,
          name.trim(),
          description?.trim(),
          maxPerDay ? maxPerDay : null,
          color,
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
