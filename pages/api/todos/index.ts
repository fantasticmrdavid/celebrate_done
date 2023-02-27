import { NextApiRequest, NextApiResponse } from 'next'
import { getTodos } from '@/pages/api/todos/getTodos'
import { addTodo } from '@/pages/api/todos/addTodo'
import { updateTodos } from '@/pages/api/todos/updateTodo'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case 'GET':
      return await getTodos(req, res)
    case 'POST':
      return await addTodo(req, res)
    case 'PATCH':
      return await updateTodos(req, res)
  }
}
