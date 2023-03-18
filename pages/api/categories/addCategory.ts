import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'

export const addCategory = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { name, description, maxPerDay } = req.body
    const insertCategoryQuery = `INSERT into categories
            VALUES (
                null,
                ${SqlString.escape(name)},
                ${SqlString.escape(description)},
                ${maxPerDay ? maxPerDay : null},
                0
            )`
    try {
      const result = await dbConnect
        .transaction()
        .query(insertCategoryQuery)
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
