import { NextApiRequest, NextApiResponse } from 'next'
import {
  TODO_PRIORITY,
  TODO_SIZE,
  TODO_STATUS,
} from '@/app/components/TodoItem/utils'
import dayjs from 'dayjs'
import prisma from '@/app/lib/prisma'
import { getLocalStartOfDay } from '@/app/utils'

export const addProgress = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { name, category, userId } = req.body

    const result = await prisma.todo.create({
      data: {
        name: `Chipped away at ${name}`,
        notes: `I made progress on ${name} today`,
        priority: TODO_PRIORITY.NORMAL,
        size: TODO_SIZE.SMALL,
        startDate: dayjs(new Date()).startOf('day').toISOString(),
        completedDateTime: dayjs(new Date()).startOf('day').toISOString(),
        status: TODO_STATUS.DONE,
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
      },
    })

    return res.status(200).json(result)
  } catch (error) {
    console.log('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'POST':
      return await addProgress(req, res)
  }
}
