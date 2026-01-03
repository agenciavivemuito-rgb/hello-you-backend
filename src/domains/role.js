import { db } from '../lib/db.js'

const getAllRolesDb = async () => {
  return await db.query('SELECT * FROM roles').then((res) => res.rows)
}

const getRoleByIdDb = async (id) => {
  return await db
    .query('SELECT * FROM roles WHERE id = $1', [id])
    .then((res) => res.rows[0])
}

const getRoleByNameDb = async (role_name) => {
  return await db
    .query('SELECT * FROM roles WHERE role_name = $1', [role_name])
    .then((res) => res.rows[0])
}

const createRoleDb = async (role_name, description) => {
  return await db
    .query(
      'INSERT INTO roles (role_name, description) VALUES ($1, $2) RETURNING *',
      [role_name, description]
    )
    .then((res) => res.rows[0])
}

const updateRoleDb = async (id, fields) => {
  const setString = Object.keys(fields)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ')

  const values = [...Object.values(fields), id]

  return await db
    .query(
      `UPDATE roles SET updated_at = NOW(), ${setString} WHERE id = $${
        Object.keys(fields).length + 1
      } RETURNING *`,
      values
    )
    .then((res) => res.rows[0])
}

const deleteRoleDb = async (id) => {
  return await db
    .query('DELETE FROM roles WHERE id = $1 RETURNING *', [id])
    .then((res) => res.rows[0])
}

export {
  getAllRolesDb,
  getRoleByIdDb,
  getRoleByNameDb,
  createRoleDb,
  updateRoleDb,
  deleteRoleDb,
}
