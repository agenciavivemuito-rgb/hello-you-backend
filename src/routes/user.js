import { Router } from 'express'
import {
  createUser,
  deleteUser,
  generateToken,
  getAllUsers,
  getUserById,
  updateUser,
} from '../controllers/user.js'
import { isAdmin, verifyToken } from '../middleware/auth.js'

const route = Router()

route.get('/', verifyToken, isAdmin, getAllUsers)
route.get('/:id', verifyToken, getUserById)
route.post('/', verifyToken, isAdmin, createUser)
route.post('/login', generateToken)
route.put('/:id', verifyToken, updateUser)
route.delete('/:id', verifyToken, deleteUser)

export default route
