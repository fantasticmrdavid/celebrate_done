import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { getLocalStartOfDay } from '@/app/utils'
import { TodoStatus } from '@prisma/client'

export const addTodo = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      name,
      notes,
      priority,
      size,
      category,
      startDate,
      userId,
      isRecurring,
      repeats,
    } = req.body

    const result = await prisma.todo.create({
      data: {
        name,
        notes,
        priority,
        size,
        startDate: getLocalStartOfDay(startDate),
        status: TodoStatus.INCOMPLETE,
        user: {
          connect: {
            id: userId,
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
                    id: userId,
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
