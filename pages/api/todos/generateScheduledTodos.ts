import { NextApiRequest, NextApiResponse } from 'next'
import dayjs from 'dayjs'
import { repeatDayUnitsToSqlUnits } from '@/app/components/TodoItem/utils'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import prisma from '@/app/lib/prisma'
import { Prisma, TodoStatus } from '@prisma/client'
import { getSession } from 'next-auth/react'
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

// 1. Fetch all schedules from user where the todo is done
// 2. Filter results to only those todos who are overdue since their latest completion date
// 3. Create new todo with the same details except new start date AND create new schedule that links to the new todo
// 4. Delete the old schedules referencing the old todos
export const generateScheduledTodos = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const session = await getSession({ req })
  if (!session) return res.status(401)
  const { user } = session
  if (!user) return res.status(401)
  const { tz } = req.query
  const getTargetDate = (s: ScheduleWithTodo) => {
    return dayjs(s.todo.completedDateTime)
      .tz(tz as string)
      .startOf('day')
      .add(
        repeatDayUnitsToSqlUnits[s.unit].count,
        repeatDayUnitsToSqlUnits[s.unit].unit,
      )
  }

  try {
    const scheduledTodoList = await prisma.schedule.findMany({
      include: {
        todo: true,
      },
      where: {
        AND: [
          {
            userId: {
              equals: user.id,
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

    const actionableScheduleList = scheduledTodoList.filter((t) => {
      const targetDate = getTargetDate(t)
      return dayjs().isAfter(targetDate)
    })

    const createScheduledTodos = await prisma.$transaction([
      ...actionableScheduleList.map((s) =>
        prisma.todo.create({
          data: {
            name: s.todo.name,
            notes: s.todo.notes,
            priority: s.todo.priority,
            size: s.todo.size,
            startDate: dayjs()
              .tz(tz as string)
              .startOf('day')
              .toISOString(),
            status: TodoStatus.INCOMPLETE,
            user: {
              connect: {
                id: s.todo.userId,
              },
            },
            category: {
              connect: {
                id: s.todo.categoryId,
              },
            },
            schedule: {
              create: {
                userId: s.todo.userId,
                unit: s.unit,
              },
            },
          },
        }),
      ),
      prisma.schedule.deleteMany({
        where: {
          id: {
            in: actionableScheduleList.map((a) => a.id),
          },
        },
      }),
    ])

    return res.status(200).json(createScheduledTodos)
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
      return await generateScheduledTodos(req, res)
  }
}
