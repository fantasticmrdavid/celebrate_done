import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { getLocalStartOfDay } from '@/app/utils'
import { TodoStatus } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

export const addTodo = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = await getToken({ req })
    if (!token) return res.status(401)
    const { sub } = token
    if (!sub) return res.status(401)

    const {
      name,
      notes,
      priority,
      size,
      category,
      startDate,
      isRecurring,
      repeats,
      sortOrder,
    } = req.body

    const result = await prisma.todo.create({
      data: {
        name,
        notes,
        priority,
        size,
        startDate: getLocalStartOfDay(startDate),
        status: TodoStatus.INCOMPLETE,
        sortOrder,
        user: {
          connect: {
            id: sub,
          },
        },
        category: {
          connect: {
            id: category.id,
          },
        },
        schedule: isRecurring
          ? {
              create: {
                unit: repeats,
                user: {
                  connect: {
                    id: sub,
                  },
                },
              },
            }
          : undefined,
      },
    })

    return res.status(200).json(result)
  } catch (error) {
    console.log('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}
