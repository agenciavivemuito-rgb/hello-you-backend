import { db } from '../lib/db.js'

const getAllUsersDb = async () => {
  return await db.query('SELECT * FROM users').then((res) => res.rows)
}

const getUserByIdDb = async (id) => {
  return await db
    .query('SELECT * FROM users WHERE id = $1', [id])
    .then((res) => res.rows[0])
}

const createUserDb = async (
  name,
  email,
  password_hash,
  phone_number,
  role_id
) => {
  return await db
    .query(
      'INSERT INTO users (name, email, password_hash, phone_number, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password_hash, phone_number, role_id]
    )
    .then((res) => res.rows[0])
}

const getUserByEmailDb = async (email) => {
  return await db
    .query('SELECT * FROM users WHERE email = $1', [email])
    .then((res) => res.rows[0])
}

const updateUserDb = async (id, fields) => {
  const setString = Object.keys(fields)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ')

  const values = [...Object.values(fields), id]

  return await db
    .query(
      `UPDATE users SET updated_at = NOW(), ${setString} WHERE id = $${
        Object.keys(fields).length + 1
      } RETURNING *`,
      values
    )
    .then((res) => res.rows[0])
}

const deleteUserDb = async (id) => {
  return await db
    .query('DELETE FROM users WHERE id = $1 RETURNING *', [id])
    .then((res) => res.rows[0])
}

export {
  getAllUsersDb,
  getUserByIdDb,
  createUserDb,
  getUserByEmailDb,
  updateUserDb,
  deleteUserDb,
}
