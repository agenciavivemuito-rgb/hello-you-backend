import {
  createRoleDb,
  deleteRoleDb,
  getAllRolesDb,
  getRoleByIdDb,
  getRoleByNameDb,
  updateRoleDb,
} from '../domains/role.js'
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/ApiError.js'
import { filterText } from '../utils/helper.js'

const getAllRoles = async (req, res) => {
  const roles = await getAllRolesDb()

  return res.status(200).json(roles)
}

const getRoleById = async (req, res) => {
  const { id } = req.params

  if (!Number(id)) {
    throw new BadRequestError('Role ID must be a number')
  }

  if (!id) {
    throw new BadRequestError('Role ID is required')
  }

  const existingRole = await getRoleByIdDb(id)

  if (!existingRole) {
    throw new NotFoundError('Role not found')
  }

  const role = await getRoleByIdDb(id)

  return res.status(200).json(role)
}

const createRole = async (req, res) => {
  const { role_name, description } = req.body

  if (!role_name) {
    throw new BadRequestError('Role name is required')
  }

  const filteredName = filterText(role_name).toLowerCase()

  if (filteredName.length < 3 || filteredName.length > 50) {
    throw new BadRequestError('Role name must be between 3 and 50 characters')
  }

  const existingRole = await getRoleByNameDb(filteredName)

  if (existingRole) {
    throw new ConflictError('Role name already exists')
  }

  const createdRole = await createRoleDb(filteredName, description)

  return res.status(201).json(createdRole)
}

const updateRole = async (req, res) => {
  const { id } = req.params

  if (!Number(id)) {
    throw new BadRequestError('Role ID must be a number')
  }

  if (!id) {
    throw new BadRequestError('Role ID is required')
  }

  const existingRole = await getRoleByIdDb(id)

  if (!existingRole) {
    throw new NotFoundError('Role not found')
  }

  const possibleFields = ['role_name', 'description']

  if (Object.keys(req.body).every((key) => !possibleFields.includes(key))) {
    throw new BadRequestError('No valid fields provided for update')
  }

  const existingFields = Object.entries(req.body)
    .filter(([_, value]) => value !== undefined)
    .reduce((obj, [key, value]) => {
      obj[key] = key === 'role_name' ? filterText(value).toLowerCase() : value
      return obj
    }, {})

  if (Object.keys(existingFields).length === 0) {
    throw new BadRequestError('At least one field must be provided')
  }

  if (existingFields.role_name) {
    if (
      existingFields.role_name.length < 3 ||
      existingFields.role_name.length > 50
    ) {
      throw new BadRequestError('Role name must be between 3 and 50 characters')
    }

    const roleWithSameName = await getRoleByNameDb(existingFields.role_name)

    if (roleWithSameName && roleWithSameName.id !== Number(id)) {
      throw new ConflictError('Role name already exists')
    }
  }

  const updatedRole = await updateRoleDb(id, existingFields)

  return res.status(200).json(updatedRole)
}

const deleteRole = async (req, res) => {
  const { id } = req.params

  if (!id) {
    throw new BadRequestError('Role ID is required')
  }

  if (!Number(id)) {
    throw new BadRequestError('Role ID must be a number')
  }

  const existingRole = await getRoleByIdDb(id)

  if (!existingRole) {
    throw new NotFoundError('Role not found')
  }

  if (existingRole.role_name === 'admin') {
    throw new BadRequestError('Cannot delete admin role')
  }

  if (existingRole.role_name === 'owner') {
    throw new BadRequestError('Cannot delete owner role')
  }

  const deletedRole = await deleteRoleDb(id)

  return res.status(200).json(deletedRole)
}

export { getAllRoles, getRoleById, createRole, updateRole, deleteRole }
