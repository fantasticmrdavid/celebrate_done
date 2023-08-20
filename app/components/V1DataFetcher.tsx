// import { QueryKey, useQuery } from '@tanstack/react-query'
// import { V1DataWriter } from '@/app/components/V1DataWriter'
//
// export const V1DataFetcher = () => {
//   const { data, isLoading } = useQuery(
//     ['databaseMigration'] as unknown as QueryKey,
//     async () =>
//       await fetch(`/api/categories/getV1Data`).then((res) => res.json()),
//   )
//   if (isLoading || !data) return null
//
//   console.log(data)
//
//   return <V1DataWriter categories={data.categories} todos={data.todos} />
// }
