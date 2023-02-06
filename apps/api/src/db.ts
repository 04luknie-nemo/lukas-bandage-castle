// @ts-nocheck
import mysql from 'mysql2'

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/bandage',
  connectionLimit: 10,
  decimalNumbers: true, // otherwise money comes back as strings
})

export const promisePool = pool.promise()

// callback style, used by old routes
export function query(sql, params, cb) {
  if (typeof params === 'function') {
    cb = params
    params = []
  }
  pool.query(sql, params, function (err, rows) {
    if (err) {
      console.log('DB ERROR', err.message, sql)
      return cb(err)
    }
    cb(null, rows)
  })
}

export async function q(sql: string, params?: any[]): Promise<any> {
  const [rows] = await promisePool.query(sql, params)
  return rows
}

export default pool
