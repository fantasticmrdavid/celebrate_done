import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'

export const getSuggestions = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { userId } = req.query
  if (!userId || userId.length === 0) return {}
  try {
    const results = await prisma.todo.findMany({
      select: {
        name: true,
      },
      where: {
        AND: [
          {
            userId: {
              equals: userId as string,
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
