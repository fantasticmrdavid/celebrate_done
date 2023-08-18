import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { TodoStatus } from '@prisma/client'

export const getDoneTodosCount = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, dateRangeStart, dateRangeEnd } = req.query
  try {
    const results = await prisma.todo.count({
      where: {
        AND: [
          {
            userId: {
              equals: userId as string,
            },
          },
          {
            AND: [
              {
                status: {
                  equals: TodoStatus.DONE,
                },
              },
              {
                completedDateTime: {
                  gte: new Date(dateRangeStart as string),
                  lte: new Date(dateRangeEnd as string),
                },
              },
            ],
          },
        ],
      },
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
      return await getDoneTodosCount(req, res)
  }
}
