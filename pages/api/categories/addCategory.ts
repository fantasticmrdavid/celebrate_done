import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'
import { v4 as uuidv4 } from 'uuid'

export const addCategory = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const { name, description, maxPerDay, user_id } = req.body
		const insertCategoryQuery = `INSERT into categories
            VALUES (
                null,
                ${SqlString.escape(uuidv4())},
                ${SqlString.escape(user_id)},
                ${SqlString.escape(name)},
                ${SqlString.escape(description)},
                ${maxPerDay ? maxPerDay : null},
                0
            )`
		const result = await dbConnect
			.transaction()
			.query(insertCategoryQuery)
			.rollback((e: Error) => console.error(e))
			.commit()
		await dbConnect.end()
		return res.status(200).json(result)
	} catch (error) {
		console.log('SQL ERROR: ', error)
		return res.status(500).json({ error })
	}
}
