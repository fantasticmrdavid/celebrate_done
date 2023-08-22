import { NextApiRequest, NextApiResponse } from 'next'
import { Category } from '@prisma/client'
import { dbConnect } from '@/config/dbConnect'

export const sortCategories = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { categoryList } = req.body

    if (categoryList && Array.isArray(categoryList)) {
      const sortCategoriesQuery = `UPDATE Category
            SET
            sortOrder=(CASE id 
                ${categoryList.map(() => `WHEN ? THEN ? `).join(' ')}
            END)
            WHERE id IN (${categoryList.map(() => '?').join(',')})`
      const result = await dbConnect.query({
        sql: sortCategoriesQuery,
        values: [
          ...categoryList.flatMap((c: Category) => [c.id, c.sortOrder]),
          ...categoryList.map((c: Category) => c.id),
        ],
      })
      await dbConnect.end()

      // NOTE: Temporarily using raw sql until Prisma supports CASE/THEN statements
      // const result = await prisma.$transaction(
      //   categoryList.map((c: Category) =>
      //     prisma.category.update({
      //       data: {
      //         sortOrder: c.sortOrder,
      //       },
      //       where: {
      //         id: c.id,
      //       },
      //     }),
      //   ),
      // )
      return res.status(200).json(result)
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
