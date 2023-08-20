// import { NextApiRequest, NextApiResponse } from 'next'
// import { dbConnect } from '@/config/dbConnect'
//
// const mapResultsToCategories = (results) =>
//   results.reduce((acc, r) => {
//     if (acc.some((c) => c.id === r.categoryId)) return acc
//     return [
//       ...acc,
//       {
//         id: r.categoryId,
//         userId: r.categoryUserId,
//         name: r.categoryName,
//         description: r.categoryDescription,
//         maxPerDay: r.categoryMaxPerDay,
//         sortOrder: r.categorySortOrder,
//         color: r.categoryColor,
//         user: {
//           id: r.userId,
//           email: r.userEmail,
//         },
//       },
//     ]
//   }, [])
//
// const mapResultsToTodos = (results) =>
//   results.map((t) => ({
//     id: t.todoId,
//     created: t.todoCreated,
//     startDate: t.todoStartDate,
//     name: t.todoName,
//     notes: t.todoNotes,
//     size: t.todoSize,
//     priority: t.todoPriority,
//     status: t.todoStatus,
//     completedDateTime: t.todoCompletedDateTime,
//     sortOrder: t.todoSortOrder,
//     categoryId: t.categoryId,
//     userId: t.userId,
//   }))
//
// export const getV1Data = async (req: NextApiRequest, res: NextApiResponse) => {
//   try {
//     const query = `SELECT
//       c.uuid as categoryId,
//       c.user_uuid as categoryUserId,
//       c.name as categoryName,
//       c.description as categoryDescription,
//       c.sortOrder as categorySortOrder,
//       c.color as categoryColor,
//       c.maxPerDay as categoryMaxPerDay,
//       t.uuid as todoId,
//       t.created as todoCreated,
//       t.startDate as todoStartDate,
//       t.name as todoName,
//       t.notes as todoNotes,
//       t.size as todoSize,
//       t.priority as todoPriority,
//       t.status as todoStatus,
//       t.completedDateTime as todoCompletedDateTime,
//       t.sortOrder as todoSortOrder,
//       u.uuid as userId,
//       u.email as userEmail
//     FROM
//       categories c
//     LEFT OUTER JOIN todos_to_categories tc ON tc.category_id = c.uuid
//     LEFT OUTER JOIN todos t ON tc.todo_uuid = t.uuid
//     LEFT OUTER JOIN users u ON tc.user_id = u.uuid`
//     const results = await dbConnect.query({ sql: query })
//     await dbConnect.end()
//     return res.status(200).json({
//       categories: mapResultsToCategories(results),
//       todos: mapResultsToTodos(results),
//     })
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({ error })
//   }
// }
//
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   switch (req.method) {
//     case 'GET':
//       return await getV1Data(req, res)
//   }
// }
