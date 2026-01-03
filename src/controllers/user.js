import { getRoleByIdDb } from '../domains/role.js'
import {
  createUserDb,
  deleteUserDb,
  getAllUsersDb,
  getUserByEmailDb,
  getUserByIdDb,
  updateUserDb,
} from '../domains/user.js'
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../errors/ApiError.js'
import {
  comparePassword,
  filterText,
  hashPassword,
  isValidEmail,
  isValidPhoneNumber,
} from '../utils/helper.js'
import jwt from 'jsonwebtoken'

const getAllUsers = async (req, res) => {
  const users = await getAllUsersDb()

  users.forEach((user) => {
    delete user.password_hash
  })

  return res.status(200).json(users)
}

const getUserById = async (req, res) => {
  const { id } = req.params

  if (!Number(id)) {
    throw new BadRequestError('User ID must be a number')
  }

  if (!id) {
    throw new BadRequestError('User ID is required')
  }

  const existingUser = await getUserByIdDb(id)

  if (!existingUser) {
    throw new NotFoundError('User not found')
  }

  const user = await getUserByIdDb(id)

  delete user.password_hash

  return res.status(200).json(user)
}

const createUser = async (req, res) => {
  const { name, email, password, phone_number, role_id } = req.body

  if (!name || !email || !password || !role_id) {
    throw new BadRequestError('Name, email, role_id and password are required')
  }

  if (!Number(role_id)) {
    throw new BadRequestError('Role ID must be a number')
  }

  const filteredName = filterText(name)

  if (filteredName.length < 3 || filteredName.length > 100) {
    throw new BadRequestError('Name must be between 3 and 100 characters')
  }

  const filteredEmail = filterText(email)

  if (filteredEmail.length < 5 || filteredEmail.length > 255) {
    throw new BadRequestError('Email must be between 5 and 255 characters')
  }

  if (!isValidEmail(filteredEmail)) {
    throw new BadRequestError('Invalid email format')
  }

  const existingEmail = await getUserByEmailDb(filteredEmail)

  if (existingEmail) {
    throw new ConflictError('Email already exists')
  }

  const filteredPassword = filterText(password)

  if (filteredPassword.length < 3 || filteredPassword.length > 255) {
    throw new BadRequestError('Password must be between 3 and 255 characters')
  }

  const hashedPassword = await hashPassword(filteredPassword)

  const filteredPhoneNumber = filterText(phone_number)

  if (filteredPhoneNumber) {
    if (filteredPhoneNumber.length < 4 || filteredPhoneNumber.length > 20) {
      throw new BadRequestError('Phone number must be between 4 and 20 digits')
    }

    if (!isValidPhoneNumber(filteredPhoneNumber)) {
      throw new BadRequestError('Invalid phone number format')
    }
  }

  const createdUser = await createUserDb(
    filteredName,
    filteredEmail,
    hashedPassword,
    filteredPhoneNumber || null,
    role_id
  )

  delete createdUser.password_hash

  return res.status(201).json(createdUser)
}

const updateUser = async (req, res) => {
  const { id } = req.params

  if (!Number(id)) {
    throw new BadRequestError('User ID must be a number')
  }

  if (!id) {
    throw new BadRequestError('User ID is required')
  }

  const existingUser = await getUserByIdDb(id)

  if (!existingUser) {
    throw new NotFoundError('User not found')
  }

  const possibleFields = [
    'name',
    'email',
    'password',
    'phone_number',
    'description',
  ]

  if (Object.keys(req.body).every((key) => !possibleFields.includes(key))) {
    throw new BadRequestError('No valid fields provided for update')
  }

  const existingFields = Object.entries(req.body)
    .filter(([_, value]) => value !== undefined)
    .reduce((obj, [key, value]) => {
      obj[key] = key !== 'phone_number' ? filterText(value) : value
      return obj
    }, {})

  if (Object.keys(existingFields).length === 0) {
    throw new BadRequestError('At least one field must be provided')
  }

  if (
    existingFields.name &&
    (existingFields.name.length < 3 || existingFields.name.length > 100)
  ) {
    throw new BadRequestError('User name must be between 3 and 100 characters')
  }

  if (existingFields.email) {
    if (existingFields.email.length < 5 || existingFields.email.length > 255) {
      throw new BadRequestError('Email must be between 5 and 255 characters')
    }

    if (!isValidEmail(existingFields.email)) {
      throw new BadRequestError('Invalid email format')
    }

    const existingEmail = await getUserByEmailDb(existingFields.email)

    if (existingEmail && existingEmail.id !== Number(id)) {
      throw new ConflictError('Email already exists')
    }
  }

  if (existingFields.phone_number) {
    if (existingFields.phone_number < 4 || existingFields.phone_number > 20) {
      throw new BadRequestError('Phone number must be between 4 and 20 digits')
    }

    if (!isValidPhoneNumber(existingFields.phone_number)) {
      throw new BadRequestError('Invalid phone number format')
    }
  }

  if (existingFields.password) {
    if (
      existingFields.password.length < 3 ||
      existingFields.password.length > 255
    ) {
      throw new BadRequestError('Password must be between 3 and 255 characters')
    }

    existingFields.password_hash = await hashPassword(existingFields.password)

    delete existingFields.password
  }

  const updatedUser = await updateUserDb(id, existingFields)

  delete updatedUser.password_hash

  return res.status(200).json(updatedUser)
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  if (!id) {
    throw new BadRequestError('User ID is required')
  }

  if (!Number(id)) {
    throw new BadRequestError('User ID must be a number')
  }

  const existingUser = await getUserByIdDb(id)

  if (!existingUser) {
    throw new NotFoundError('User not found')
  }

  const deletedUser = await deleteUserDb(id)

  delete deletedUser.password_hash

  return res.status(200).json(deletedUser)
}

const generateToken = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Email and password are required')
  }

  const existingEmail = await getUserByEmailDb(email)

  if (!existingEmail) {
    throw new BadRequestError('Invalid email or password')
  }

  const isPasswordValid = await comparePassword(
    password,
    existingEmail.password_hash
  )

  if (!isPasswordValid) {
    throw new BadRequestError('Invalid email or password')
  }

  const token = jwt.sign(
    {
      id: existingEmail.id,
      email: existingEmail.email,
      role_id: existingEmail.role_id,
    },
    process.env.SECRET_KEY
  )

  const role = await getRoleByIdDb(existingEmail.role_id)

  if (!role) {
    throw new NotFoundError('Role not found')
  }

  return res.status(201).json({ role: role.role_name, token })
}

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  generateToken,
}
