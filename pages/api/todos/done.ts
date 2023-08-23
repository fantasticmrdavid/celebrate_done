import { NextApiRequest, NextApiResponse } from 'next'

import prisma from '@/app/lib/prisma'
import { TodoSize, TodoStatus } from '@prisma/client'
import { getSession } from 'next-auth/react'

type TodoCount = {
  id: string
  name: string
  count: number
  size: TodoSize
}

export type CategoryWithTodoCounts = {
  color: string | null
  description: string
  id: string
  maxPerDay: number | null
  name: string
  sortOrder: number
  todos: TodoCount[]
}

export const getDoneTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const session = await getSession({ req })
  if (!session) return res.status(401)
  const { user } = session
  if (!user) return res.status(401)
  const { dateRangeStart, dateRangeEnd } = req.query
  try {
    const categoryResults = await prisma.category.findMany({
      include: {
        todos: {
          where: {
            AND: [
              {
                status: {
                  equals: TodoStatus.DONE,
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
          equals: user.id as string,
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
                    size: t.size,
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
