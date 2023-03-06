import { NextApiRequest, NextApiResponse } from 'next'
import { TODO_STATUS } from '@/app/components/TodoItem/types'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'

export const addTodo = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, description, size, category, startDate } = req.body
    const createdDateTime = `"${new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')}"`
    const insertTodoQuery = `INSERT into todos
            VALUES (
                null,
                ${createdDateTime},
                ${SqlString.escape(startDate)},
                ${SqlString.escape(name)},
                ${SqlString.escape(description)},
                '${size}',
                '${TODO_STATUS.INCOMPLETE}',
                null
            )`
    try {
      const todoResult = await dbConnect
        .transaction()
        .query(insertTodoQuery)
        .query((r: any) => {
          if (r.affectedRows === 1) {
            return [
              `INSERT into todos_to_categories VALUES(null, ${r.insertId}, ${category.id})`,
            ]
          } else {
            return null
          }
        })
        .rollback((e: any) => console.error(e))
        .commit()
      const result = todoResult
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
