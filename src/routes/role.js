import { Router } from 'express'
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  updateRole,
} from '../controllers/role.js'

const route = Router()

route.get('/', getAllRoles)
route.get('/:id', getRoleById)
route.post('/', createRole)
route.put('/:id', updateRole)
route.delete('/:id', deleteRole)

export default route
