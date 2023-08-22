import mysql from 'serverless-mysql'

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env

const dbConnect = mysql({
  config: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    port: DB_PORT as unknown as number,
    database: DB_NAME,
    timezone: 'utc',
  },
})

export { dbConnect }
