import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'

export const addCategory = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { name, description, maxPerDay, userId, color } = req.body

    const result = await prisma.category.create({
      data: {
        userId,
        name,
        description,
        maxPerDay,
        color,
      },
    })

    return res.status(200).json(result)
  } catch (error) {
    console.log('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}
