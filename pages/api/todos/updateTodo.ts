import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import dayjs from 'dayjs'
import { TodoWithRelations } from '@/pages/api/todos/getTodos'
import { TodoStatus } from '@prisma/client'

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

        result = await prisma.$transaction(
          todoList.map((t: TodoWithRelations, i: number) =>
            prisma.todo.update({
              data: {
                sortOrder: i,
              },
              where: {
                id: t.id,
              },
            }),
          ),
        )
        break
      }
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

        const scheduleQuery = async () => {
          if (schedule && repeats) {
            return prisma.schedule.update({
              where: {
                todoId: id,
              },
              data: {
                unit: repeats,
              },
            })
          } else if (!schedule && repeats) {
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
                    id: userId,
                  },
                },
              },
            })
          } else if (!repeats) {
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
