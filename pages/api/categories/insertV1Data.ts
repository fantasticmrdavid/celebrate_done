// import { NextApiRequest, NextApiResponse } from 'next'
// import prisma from '@/app/lib/prisma'
//
// export const insertV1Data = async (
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) => {
//   try {
//     const { categories, todos } = req.body
//
//     if (!categories || !todos) return null
//
//     const result = categories.slice(33, 37).map(
//       async (c) =>
//         await prisma.category.create({
//           data: {
//             name: c.name,
//             description: c.description,
//             maxPerDay: c.maxPerDay,
//             color: c.color,
//             sortOrder: c.sortOrder,
//             user: {
//               connect: {
//                 email: c.user.email,
//               },
//             },
//             todos: {
//               create: todos.reduce((acc, t) => {
//                 if (!t.name || t.categoryId !== c.id) return acc
//
//                 return [
//                   ...acc,
//                   {
//                     created: t.created,
//                     startDate: t.startDate,
//                     name: t.name,
//                     notes: t.notes,
//                     size: t.size,
//                     priority: t.priority,
//                     status: t.status,
//                     completedDateTime: t.completedDateTime,
//                     sortOrder: t.sortOrder,
//                     user: {
//                       connect: {
//                         email: c.user.email,
//                       },
//                     },
//                   },
//                 ]
//               }, []),
//             },
//           },
//         }),
//     )
//     return res.status(200).json(result)
//   } catch (error) {
//     console.log('SQL ERROR: ', error)
//     return res.status(500).json({ error })
//   }
// }
//
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   switch (req.method) {
//     case 'POST':
//       return await insertV1Data(req, res)
//   }
// }
