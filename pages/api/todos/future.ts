import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { Prisma, TodoStatus } from '@prisma/client'
import dayjs from 'dayjs'
import { repeatDayUnitsToSqlUnits } from '@/app/components/TodoItem/utils'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

const scheduleWithTodo = Prisma.validator<Prisma.ScheduleDefaultArgs>()({
  include: {
    todo: true,
  },
})

export type ScheduleWithTodo = Prisma.ScheduleGetPayload<
  typeof scheduleWithTodo
>

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
  const { userId, dateRangeStart, dateRangeEnd, tz } = req.query
  if (!userId) return {}

  try {
    const getTargetDate = (s: ScheduleWithTodo) => {
      return dayjs(s.todo.completedDateTime)
        .tz(tz as string)
        .startOf('day')
        .add(
          repeatDayUnitsToSqlUnits[s.unit].count,
          repeatDayUnitsToSqlUnits[s.unit].unit,
        )
    }

    const scheduledTodoList = await prisma.schedule.findMany({
      include: {
        todo: true,
      },
      where: {
        AND: [
          {
            userId: {
              equals: userId as string,
            },
          },
          {
            todo: {
              status: {
                equals: TodoStatus.DONE,
              },
            },
          },
        ],
      },
    })

    const schedules = scheduledTodoList
      .filter((s) => {
        const targetDate = getTargetDate(s)
        return dayjs(dateRangeEnd as string).isAfter(targetDate)
      })
      .map((s) => ({
        ...s,
        todo: {
          ...s.todo,
          startDate: getTargetDate(s),
        },
      }))

    const todos = await prisma.todo.findMany({
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
              equals: TodoStatus.INCOMPLETE,
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

    return res.status(200).json({
      schedules,
      todos,
    })
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
