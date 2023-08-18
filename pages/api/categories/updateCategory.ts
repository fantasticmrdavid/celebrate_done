import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'

export const updateCategory = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { id, name, description, maxPerDay, color, sortOrder } = req.body

    const result = await prisma.category.update({
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

    return res.status(200).json(result)
  } catch (error) {
    console.log('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}
