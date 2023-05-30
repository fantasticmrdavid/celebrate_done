import { NextApiRequest, NextApiResponse } from 'next'
import { TODO_STATUS } from '@/app/components/TodoItem/types'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'
import { v4 as uuidv4 } from 'uuid'
import { dateIsoToSql } from '@/pages/api/utils'

export const addTodo = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, notes, priority, size, category, startDate, user_id } =
      req.body
    const createdDateTime = dateIsoToSql(new Date().toISOString())
    const new_uuid = uuidv4()
    const insertTodoQuery = `INSERT into todos
            VALUES (
                null,
                ${SqlString.escape(new_uuid)},
                ${SqlString.escape(createdDateTime)},
                ${SqlString.escape(dateIsoToSql(startDate))},
                ${SqlString.escape(name.trim())},
                ${SqlString.escape(notes.trim())},
                '${size}',
                '${priority}',
                '${TODO_STATUS.INCOMPLETE}',
                null,
                999
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
                  ${SqlString.escape(category.uuid)},
                  ${SqlString.escape(user_id)}
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
