import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { Prisma, TodoStatus } from '@prisma/client'
import { getSession } from 'next-auth/react'

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
  const session = await getSession({ req })
  if (!session) return res.status(401)
  const { user } = session
  if (!user) return res.status(401)
  const { localStartOfDay, localEndOfDay } = req.query

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
              equals: user.id,
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
