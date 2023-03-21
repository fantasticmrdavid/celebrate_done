import { NextApiRequest, NextApiResponse } from 'next'
import { getUsers } from './getUsers'

export type UserResponse = {
  uuid: string
  username: string
  email: string
  firstname: string
  surname: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponse[]>
) {
  switch (req.method) {
    case 'GET':
      return await getUsers(req, res)
  }
}
