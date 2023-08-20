// import axios from 'axios'
// import { useEffect, useState } from 'react'
//
// export const V1DataWriter = (props) => {
//   const [hasActioned, setHasActioned] = useState(false)
//
//   useEffect(() => {
//     if (!hasActioned) {
//       axios
//         .post('/api/categories/insertV1Data', {
//           categories: props.categories,
//           todos: props.todos,
//         })
//         .then(() => {
//           setHasActioned(true)
//           console.log('DATA INSERT SUCCESSFUL')
//         })
//     }
//   }, [hasActioned, props.categories, props.todos])
//
//   return null
// }
