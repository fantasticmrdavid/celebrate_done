import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { Prisma, TodoStatus } from '@prisma/client'

const todoWithRelations = Prisma.validator<Prisma.TodoDefaultArgs>()({
  include: {
    category: true,
    schedule: true,
  },
})

const todoWithRelationsNoCategory = Prisma.validator<Prisma.TodoDefaultArgs>()({
  include: {
    schedule: true,
  },
})

export type TodoWithRelations = Prisma.TodoGetPayload<typeof todoWithRelations>

export type TodoWithRelationsNoCategory = Prisma.TodoGetPayload<
  typeof todoWithRelationsNoCategory
>

export const getTodos = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, localStartOfDay, localEndOfDay } = req.query
  if (!userId || typeof userId !== 'string' || userId.length === 0) return {}

  try {
    const results = await prisma.todo.findMany({
      include: {
        category: true,
        schedule: true,
      },
      where: {
        AND: [
          {
            userId: {
              equals: userId as string,
            },
          },
          {
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
                      gte: new Date(localStartOfDay as string),
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
        ],
      },
      orderBy: [
        {
          sortOrder: 'asc',
        },
        { name: 'asc' },
      ],
    })

    // TODO: Sort
    // (t.status = "${TODO_STATUS.INCOMPLETE}") DESC,
    //   (t.priority = "${TODO_PRIORITY.URGENT}") DESC,
    //   (t.sortOrder) ASC,
    //   t.id, c.name, t.name ASC`
    return res.status(200).json(results)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}
