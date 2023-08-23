import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { getSession } from 'next-auth/react'

export const getSuggestions = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const session = await getSession({ req })
  if (!session) return res.status(401)
  const { user } = session
  if (!user) return res.status(401)

  try {
    const results = await prisma.todo.findMany({
      select: {
        name: true,
      },
      distinct: ['name'],
      where: {
        AND: [
          {
            userId: {
              equals: user.id,
            },
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
    return res.status(200).json(results)
  } catch (error) {
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'GET':
      return await getSuggestions(req, res)
  }
}
