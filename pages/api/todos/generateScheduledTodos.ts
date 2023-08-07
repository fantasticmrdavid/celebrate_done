import { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '@/config/dbConnect'
import SqlString from 'sqlstring'
import dayjs from 'dayjs'
import {
  repeatDayUnitsToSqlUnits,
  TODO_PRIORITY,
  TODO_REPEAT_FREQUENCY,
  TODO_SIZE,
  TODO_STATUS,
} from '@/app/components/TodoItem/utils'
import { v4 as uuidv4 } from 'uuid'
import { dateIsoToSql } from '@/pages/api/utils'

type FetchResult = {
  id: number
  uuid: string
  created: string
  startDate: string
  name: string
  notes: string
  size: TODO_SIZE
  priority: TODO_PRIORITY
  status: TODO_STATUS
  completedDateTime: string
  sortOrder: number
  count: number
  unit: TODO_REPEAT_FREQUENCY
  user_id: string
  category_id: string
  source_todo_id: string
  latestCompletedDateTime: string
  incompleteCount: number
}

const getTargetDate = (r: FetchResult) => {
  return dayjs(new Date(r.latestCompletedDateTime))
    .startOf('day')
    .add(
      repeatDayUnitsToSqlUnits[r.unit as TODO_REPEAT_FREQUENCY].count,
      repeatDayUnitsToSqlUnits[r.unit as TODO_REPEAT_FREQUENCY].unit,
    )
}

// 1. Fetch all todos from the user that match the scheduled name and are not incomplete
// 2. Filter results to only those todos who are overdue since their latest completion date
// 3. Create new todo with the same details except new start date
// 4. Update schedule to point to the latest copy of the recurring todo
export const generateScheduledTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { user_id } = req.query
  if (!user_id || user_id.length === 0) return {}

  try {
    const query = `
      SELECT 
        t.*, 
        s.count,
        s.unit,
        s.user_id,
        s.todo_id as source_todo_id,
        tc.category_id,
        MAX(t.completedDateTime) as latestCompletedDateTime,
        COUNT(IF (t.status = "INCOMPLETE", t.status, null)) as incompleteCount
      FROM schedules s
      LEFT JOIN todos t
        ON t.uuid = s.todo_id
      LEFT JOIN todos_to_categories tc
        ON t.uuid = tc.todo_uuid
      GROUP BY t.uuid
      HAVING 
        incompleteCount = 0 
        AND s.user_id = ${SqlString.escape(user_id)};
      `
    const results: FetchResult[] = await dbConnect.query(query)
    await dbConnect.end()
    const createdDateTime = dateIsoToSql(new Date().toISOString())
    const actionableResults = results.reduce((acc: FetchResult[], r) => {
      const targetDate = getTargetDate(r)
      const new_uuid = uuidv4()
      return dayjs().isAfter(targetDate)
        ? [
            {
              ...r,
              uuid: new_uuid,
              created: createdDateTime,
              startDate: dateIsoToSql(targetDate.toISOString()),
            },
            ...acc,
          ]
        : acc
    }, [])
    if (actionableResults.length > 0) {
      const insertTodoQuery = `INSERT into todos
        VALUES ${actionableResults
          .map((r) => {
            return `(
            null,
            ${SqlString.escape(r.uuid)},
            ${SqlString.escape(r.created)},
            ${SqlString.escape(r.startDate)},
            ${SqlString.escape(r.name.trim())},
            ${SqlString.escape(r.notes?.trim())},
            '${r.size}',
            '${r.priority}',
            '${TODO_STATUS.INCOMPLETE}',
            null,
            '${r.sortOrder}'
          )`
          })
          .join(',')}`
      const actionableQueryResult = await dbConnect
        .transaction()
        .query(insertTodoQuery)
        .query((r: { affectedRows: number; insertId: number }) => {
          if (r.affectedRows === actionableResults.length) {
            const insertCategoriesTodosQuery = `INSERT into todos_to_categories
              VALUES ${actionableResults
                .map((a) => {
                  return `(
                  null,
                  null,
                  ${SqlString.escape(a.category_id)},
                  ${SqlString.escape(a.user_id)},
                  ${SqlString.escape(a.uuid)}
                )`
                })
                .join(',')}`
            return [insertCategoriesTodosQuery]
          } else {
            return null
          }
        })
        .query((r: { affectedRows: number; insertId: number }) => {
          if (r.affectedRows === actionableResults.length) {
            const updateSchedulesQuery = `UPDATE schedules
              SET todo_id = CASE todo_id  
              ${actionableResults
                .map((a) => {
                  return `WHEN ${SqlString.escape(
                    a.source_todo_id,
                  )} THEN ${SqlString.escape(a.uuid)}`
                })
                .join('\n')}
              ELSE todo_id END
              WHERE todo_id IN (
                ${actionableResults
                  .map((a) => SqlString.escape(a.source_todo_id))
                  .join(',')}
              )`
            return [updateSchedulesQuery]
          } else {
            return null
          }
        })
        .rollback((e: Error) => console.error(e))
        .commit()
      await dbConnect.end()
      return res.status(200).json(actionableQueryResult)
    }
    return res.status(200).json(actionableResults)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET':
      return await generateScheduledTodos(req, res)
  }
}
