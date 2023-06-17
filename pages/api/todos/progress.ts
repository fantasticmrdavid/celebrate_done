import { NextApiRequest, NextApiResponse } from 'next'
import {
  TODO_PRIORITY,
  TODO_SIZE,
  TODO_STATUS,
} from '@/app/components/TodoItem/types'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'
import { v4 as uuidv4 } from 'uuid'
import { dateIsoToSql } from '@/pages/api/utils'
import dayjs from 'dayjs'

export const addProgress = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { name, category, user_id } = req.body
    const createdDateTime = dateIsoToSql(new Date().toISOString())
    const new_uuid = uuidv4()
    const insertTodoQuery = `INSERT into todos
            VALUES (
                null,
                ${SqlString.escape(new_uuid)},
                ${SqlString.escape(createdDateTime)},
                ${SqlString.escape(
                  dateIsoToSql(dayjs(new Date()).startOf('day').toISOString())
                )},
                ${SqlString.escape(`Chipped away at ${name.trim()}`)},
                ${SqlString.escape(`I made progress on ${name.trim()} today`)},
                '${TODO_SIZE.SMALL}',
                '${TODO_PRIORITY.NORMAL}',
                '${TODO_STATUS.DONE}',
                ${SqlString.escape(createdDateTime)},
                999
            )`
    const todoResult = await dbConnect
      .transaction()
      .query(insertTodoQuery)
      .query((r: { affectedRows: number; insertId: number }) => {
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
      .rollback((e: Error) => console.error(e))
      .commit()
    const result = todoResult
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
    case 'POST':
      return await addProgress(req, res)
  }
}
