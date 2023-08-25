// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { Prisma, TodoStatus } from '@prisma/client'
import { getSession } from 'next-auth/react'

const categoryWithRelations = Prisma.validator<Prisma.CategoryDefaultArgs>()({
  include: {
    todos: {
      include: {
        schedule: true,
      },
    },
    user: true,
  },
})

export type CategoryWithRelations = Prisma.CategoryGetPayload<
  typeof categoryWithRelations
>
export const getCategories = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const session = await getSession({ req })
    if (!session) return res.status(401)
    const { user } = session
    if (!user) return res.status(401)
    const { localStartOfDay, localEndOfDay } = req.query

    const results = await prisma.category.findMany({
      include: {
        todos: {
          where: {
            OR: [
              {
                AND: [
                  {
                    status: {
                      not: {
                        equals: TodoStatus.DONE,
                      },
                    },
                  },
                  {
                    startDate: {
                      lte: new Date(localStartOfDay as string),
                    },
                  },
                ],
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
                      lte: new Date(localEndOfDay as string),
                      gte: new Date(localStartOfDay as string),
                    },
                  },
                ],
              },
            ],
          },
          include: {
            schedule: true,
          },
          orderBy: [{ sortOrder: 'desc' }],
        },
      },
      where: {
        userId: {
          equals: user.id as string,
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    return res.status(200).json(results)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}
