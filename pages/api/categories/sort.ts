import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { Category } from '@prisma/client'

export const sortCategories = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { categoryList } = req.body

    if (categoryList && Array.isArray(categoryList)) {
      const result = await prisma.$transaction(
        categoryList.map((c: Category) =>
          prisma.category.update({
            data: {
              sortOrder: c.sortOrder,
            },
            where: {
              id: c.id,
            },
          }),
        ),
      )
      return res.status(200).json(result)
    } else {
      return res.status(200).json({})
    }
  } catch (error) {
    console.log('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'PATCH':
      return await sortCategories(req, res)
  }
}
