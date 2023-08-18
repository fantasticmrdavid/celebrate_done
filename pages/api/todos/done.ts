import { NextApiRequest, NextApiResponse } from 'next'
import { TODO_SIZE, TODO_STATUS } from '@/app/components/TodoItem/utils'

import prisma from '@/app/lib/prisma'

type TodoCount = {
  id: string
  name: string
  count: number
  size: TODO_SIZE
}

export type CategoryWithTodoCounts = {
  color: string | null
  description: string
  id: string
  maxPerDay: number | null
  name: string
  sortOrder: number
  todos: TodoCount[]
  userId: string
}

export const getDoneTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId, dateRangeStart, dateRangeEnd } = req.query
  try {
    const categoryResults = await prisma.category.findMany({
      include: {
        todos: {
          where: {
            AND: [
              {
                status: {
                  equals: TODO_STATUS.DONE,
                },
              },
              {
                completedDateTime: {
                  gte: dateRangeStart as string,
                  lte: dateRangeEnd as string,
                },
              },
            ],
          },
        },
      },
      where: {
        userId: {
          equals: userId as string,
        },
      },
      orderBy: [{ sortOrder: 'desc' }],
    })

    const results = categoryResults.reduce((acc, c) => {
      return c.todos.length > 0
        ? [
            ...acc,
            {
              ...c,
              todos: c.todos.reduce((cTodos, t) => {
                if (cTodos.some((ct) => ct.name === t.name)) return cTodos
                return [
                  ...cTodos,
                  {
                    id: t.id,
                    name: t.name,
                    size: t.size as TODO_SIZE,
                    count: c.todos.filter((tt) => tt.name === t.name).length,
                  },
                ]
              }, [] as TodoCount[]),
            },
          ]
        : acc
    }, [] as CategoryWithTodoCounts[])
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
      return await getDoneTodos(req, res)
  }
}
