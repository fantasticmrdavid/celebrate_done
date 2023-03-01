// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getCategories } from './getCategories'
import { addCategory } from './addCategory'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case 'GET':
      return await getCategories(req, res)
    case 'POST':
      return await addCategory(req, res)
  }
}
