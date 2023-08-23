import { NextApiRequest, NextApiResponse } from 'next'
import dayjs from 'dayjs'
import prisma from '@/app/lib/prisma'
import { TodoPriority, TodoSize, TodoStatus } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

export const addProgress = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const token = await getToken({ req })
    if (!token) return res.status(401)
    const { sub } = token
    if (!sub) return res.status(401)
    const { name, category } = req.body

    const result = await prisma.todo.create({
      data: {
        name: `Chipped away at ${name}`,
        notes: `I made progress on ${name} today`,
        priority: TodoPriority.NORMAL,
        size: TodoSize.SMALL,
        startDate: dayjs(new Date()).startOf('day').toISOString(),
        completedDateTime: dayjs(new Date()).startOf('day').toISOString(),
        status: TodoStatus.DONE,
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
