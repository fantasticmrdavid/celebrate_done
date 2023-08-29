import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import dayjs from 'dayjs'
import { TodoStatus } from '@prisma/client'
import { dbConnect } from '@/config/dbConnect'
import { getToken } from 'next-auth/jwt'

export const updateTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const token = await getToken({ req })
    if (!token) return res.status(401)
    const { sub } = token
    if (!sub) return res.status(401)

    const { action } = req.body
    let result

    switch (action) {
      case 'complete': {
        const { id, status, completedDateTime } = req.body
        const updateCompletionQuery = {
          where: {
            id,
          },
          data: {
            completedDateTime:
              status === TodoStatus.DONE ? completedDateTime : null,
            status: status,
          },
        }
        result = await prisma.todo.update(updateCompletionQuery)
        break
      }
      case 'togglePriority': {
        const { id, priority } = req.body
        const updatePriorityQuery = {
          where: {
            id,
          },
          data: {
            priority,
          },
        }
        result = await prisma.todo.update(updatePriorityQuery)
        break
      }
      case 'updateSortOrder': {
        const { todoList } = req.body
        if (todoList && Array.isArray(todoList)) {
          const sortSqlQuery = {
            sql: `UPDATE Todo
             SET
              sortOrder=(CASE id 
                  ${todoList.map(() => `WHEN ? THEN ? `).join(' ')}
              END)
              WHERE id IN (${todoList.map(() => '?').join(',')})`,
            values: [
              ...todoList.flatMap((t) => [t.id, t.sortOrder]),
              ...todoList.map((t) => t.id),
            ],
          }
          result = await dbConnect.query(sortSqlQuery)
          await dbConnect.end()
          // NOTE: Temporarily using raw sql until Prisma supports CASE/THEN statements
          // result = await prisma.$transaction(
          //   todoList.map((t: TodoWithRelations) =>
          //     prisma.todo.update({
          //       data: {
          //         sortOrder: t.sortOrder,
          //       },
          //       where: {
          //         id: t.id,
          //       },
          //     }),
          //   ),
          // )
        }
        break
      }
      case 'update': {
        const token = await getToken({ req })
        if (!token) return res.status(401)
        const { sub } = token
        if (!sub) return res.status(401)

        const {
          id,
          name,
          startDate,
          notes,
          size,
          priority,
          category,
          schedule,
          repeats,
          isRecurring,
        } = req.body

        const scheduleQuery = async () => {
          if (schedule && isRecurring) {
            return prisma.schedule.update({
              where: {
                todoId: id,
              },
              data: {
                unit: repeats,
              },
            })
          } else if (!schedule && isRecurring) {
            return prisma.schedule.create({
              data: {
                unit: repeats,
                todo: {
                  connect: {
                    id,
                  },
                },
                user: {
                  connect: {
                    id: sub,
                  },
                },
              },
            })
          } else if (schedule && !isRecurring) {
            return prisma.schedule.delete({
              where: {
                todoId: id,
              },
            })
          }
        }

        const updateTodoQuery = {
          where: {
            id,
          },
          data: {
            name,
            startDate: dayjs(new Date(startDate)).startOf('day').toISOString(),
            notes,
            size,
            priority,
            categoryId: category.id,
          },
        }

        result = await prisma.todo.update(updateTodoQuery)
        await scheduleQuery()
        break
      }
      default:
        result = {}
    }
    return res.status(200).json(result)
  } catch (error) {
    console.error('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}
