import { NextApiRequest, NextApiResponse } from 'next'
import { TODO_STATUS } from '@/app/components/TodoItem/utils'
import prisma from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'

const todoWithCategory = Prisma.validator<Prisma.TodoDefaultArgs>()({
  include: {
    category: true,
  },
})

export type TodoWithCategory = Prisma.TodoGetPayload<typeof todoWithCategory>

export const getFutureTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, dateRangeStart, dateRangeEnd } = req.query
  if (!userId) return {}

  try {
    const results = await prisma.todo.findMany({
      include: {
        category: true,
      },
      where: {
        AND: [
          {
            userId: {
              equals: userId as string,
            },
          },
          {
            status: {
              equals: TODO_STATUS.INCOMPLETE,
            },
          },
          {
            startDate: {
              gte: dateRangeStart as string,
              lte: dateRangeEnd as string,
            },
          },
        ],
      },
      orderBy: [
        {
          startDate: 'asc',
        },
        {
          priority: 'desc',
        },
        {
          category: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
    })

    return res.status(200).json(results)
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
      return await getFutureTodos(req, res)
  }
}
