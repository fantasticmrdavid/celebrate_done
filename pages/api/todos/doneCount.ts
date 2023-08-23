import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { TodoStatus } from '@prisma/client'
import { getSession } from 'next-auth/react'

export const getDoneTodosCount = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const session = await getSession({ req })
  if (!session) return res.status(401)
  const { user } = session
  if (!user) return res.status(401)
  const { dateRangeStart, dateRangeEnd } = req.query
  try {
    const results = await prisma.todo.count({
      where: {
        AND: [
          {
            userId: {
              equals: user.id,
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
