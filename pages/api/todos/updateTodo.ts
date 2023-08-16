import { NextApiRequest, NextApiResponse } from 'next'
import { TODO_STATUS } from '@/app/components/TodoItem/utils'
import prisma from '@/app/lib/prisma'
import dayjs from 'dayjs'

export const updateTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
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
              status === TODO_STATUS.DONE ? completedDateTime : null,
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
      // case 'updateSortOrder': {
      //   const { category, todoList } = req.body
      //   updateTodoQuery = {
      //     sql: `UPDATE todos
      //        SET
      //         sortOrder=(CASE uuid
      //             ${todoList.map(() => `WHEN ? THEN ? `).join(' ')}
      //         END)
      //         WHERE uuid IN (${todoList.map(() => '?').join(',')})`,
      //     values: [
      //       ...todoList.flatMap((t: Todo, i: number) => [t.uuid, i]),
      //       ...todoList.map((t: Todo) => t.uuid),
      //     ],
      //   }
      //
      //   updateTodoQuery = {
      //     where: {
      //       categoryId: category.id,
      //     },
      //     data: {
      //       completedDateTime:
      //         status === TODO_STATUS.DONE ? completedDateTime : null,
      //       status: status,
      //     },
      //   }
      //   break
      // }
      case 'update': {
        const {
          id,
          userId,
          name,
          startDate,
          notes,
          size,
          priority,
          category,
          schedule,
          repeats,
        } = req.body

        const scheduleQuery = () => {
          if (schedule && repeats) {
            prisma.schedule.update({
              where: {
                id: schedule.id,
              },
              data: {
                unit: repeats,
              },
            })
          } else if (!schedule && repeats) {
            prisma.schedule.create({
              data: {
                unit: repeats,
                todo: {
                  connect: {
                    id,
                  },
                },
                user: {
                  connect: {
                    id: userId,
                  },
                },
              },
            })
          } else if (!repeats) {
            prisma.schedule.delete({
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
        scheduleQuery()
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
