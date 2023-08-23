import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { getToken } from 'next-auth/jwt'

export const addCategory = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const token = await getToken({ req })
    if (!token) return res.status(401)
    const { sub } = token
    if (!sub) return res.status(401)

    const { name, description, maxPerDay, color } = req.body

    const result = await prisma.category.create({
      data: {
        userId: sub,
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
