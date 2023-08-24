import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/app/lib/prisma'
import { getToken } from 'next-auth/jwt'

type Data = {
  name: string
}

export const deleteTodo = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req })
  if (!token) return res.status(401)
  const { sub } = token
  if (!sub) return res.status(401)

  const { id } = req.query

  if (!id)
    return res
      .status(500)
      .json({ message: 'Error: Invalid or no ID defined for deletion.' })

  try {
    const result = await prisma.todo.delete({
      where: {
        id: id as string,
      },
    })
    return res.status(200).json(result)
  } catch (error) {
    console.error('SQL ERROR: ', error)
    return res.status(500).json({ error })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  switch (req.method) {
    case 'DELETE':
      return await deleteTodo(req, res)
  }
}
