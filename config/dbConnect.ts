import mysql from 'serverless-mysql'

const { DB_HOST, DB_PORT, DB_V1_USER, DB_V1_PASS, DB_V1_NAME } = process.env

const dbConnect = mysql({
  config: {
    host: DB_HOST,
    user: DB_V1_USER,
    password: DB_V1_PASS,
    port: DB_PORT as unknown as number,
    database: DB_V1_NAME,
    timezone: 'utc',
  },
})

export { dbConnect }
