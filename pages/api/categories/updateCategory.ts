import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { getToken } from 'next-auth/jwt'

export const updateCategory = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const token = await getToken({ req })
    if (!token) return res.status(401)
    const { sub } = token
    if (!sub) return res.status(401)

    const { action, id } = req.body

    let result

    switch (action) {
      case 'update': {
        const { id, name, description, maxPerDay, color, sortOrder } = req.body
        result = await prisma.category.update({
          data: {
            name,
            description,
            maxPerDay,
            color,
            sortOrder,
          },
          where: {
            id,
          },
        })
        break
      }
      case 'toggleCollapse': {
        const { isCollapsed } = req.body
        result = await prisma.category.update({
          data: {
            isCollapsed,
          },
          where: {
            id,
          },
        })
        break
      }
      default: {
        result = {}
      }
    }

    return res.status(200).json(result)
  } catch (error) {
    console.log('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}
