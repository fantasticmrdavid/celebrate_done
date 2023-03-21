import { NextApiRequest, NextApiResponse } from 'next'
import { TODO_STATUS } from '@/app/components/TodoItem/types'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'
import { v4 as uuidv4 } from 'uuid'

export const addTodo = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, description, priority, size, category, startDate } = req.body
    const createdDateTime = `"${new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')}"`
    const new_uuid = uuidv4()
    const insertTodoQuery = `INSERT into todos
            VALUES (
                null,
                ${SqlString.escape(new_uuid)},
                ${createdDateTime},
                ${SqlString.escape(startDate)},
                ${SqlString.escape(name)},
                ${SqlString.escape(description)},
                '${size}',
                '${priority}',
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
              `INSERT into todos_to_categories
                VALUES(
                  null,
                  ${r.insertId},
                  "${category.uuid}",
                  "32af11c6-000d-4656-8db2-e3f795c020d5"
                )`,
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
