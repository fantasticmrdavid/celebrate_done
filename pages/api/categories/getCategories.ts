// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { TODO_STATUS } from '@/app/components/TodoItem/utils'

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
    const { userId, localStartOfDay, localEndOfDay } = req.query

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
                        equals: TODO_STATUS.DONE,
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
                      equals: TODO_STATUS.DONE,
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
        },
      },
      where: {
        userId: {
          equals: userId as string,
        },
      },
      orderBy: [{ sortOrder: 'desc' }, { name: 'asc' }],
    })
    return res.status(200).json(results)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}
