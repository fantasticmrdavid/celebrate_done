import { NextApiRequest, NextApiResponse } from 'next'
import { TODO_STATUS } from '@/app/components/TodoItem/utils'
import prisma from '@/app/lib/prisma'
import { getLocalStartOfDay } from '@/app/utils'

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

    console.log('LOCAL START DATE: ', getLocalStartOfDay(startDate))

    const result = await prisma.todo.create({
      data: {
        name,
        notes,
        priority,
        size,
        startDate: getLocalStartOfDay(startDate),
        status: TODO_STATUS.INCOMPLETE,
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
