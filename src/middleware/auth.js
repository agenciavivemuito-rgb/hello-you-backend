import jwt from 'jsonwebtoken'
import { ForbiddenError, UnauthorizedError } from '../errors/ApiError.js'
import { getRoleByIdDb } from '../domains/role.js'

const verifyToken = (req, res, next) => {
  try {
    const headers = req.headers['authorization']

    const token = headers.split(' ')[1]

    const payload = jwt.verify(token, process.env.SECRET_KEY)

    req.user = payload

    next()
  } catch (error) {
    throw new UnauthorizedError('Invalid token, lacking credentials.')
  }
}

const isAdmin = async (req, res, next) => {
  const { role_id } = req.user

  if (!role_id) {
    throw new UnauthorizedError('Role is missing.')
  }

  const { role_name } = await getRoleByIdDb(role_id)

  if (
    role_name.toLowerCase().trim() !== 'admin' &&
    role_name.toLowerCase().trim() !== 'owner'
  ) {
    throw new ForbiddenError('Access denied, insufficient permissions.')
  }

  next()
}

const isOwner = async (req, res, next) => {
  const { role_id } = req.user

  if (!role_id) {
    throw new UnauthorizedError('Role is missing.')
  }

  const { role_name } = await getRoleByIdDb(role_id)

  if (role_name.toLowerCase().trim() !== 'owner') {
    throw new ForbiddenError('Access denied, insufficient permissions.')
  }

  next()
}

export { verifyToken, isAdmin, isOwner }
