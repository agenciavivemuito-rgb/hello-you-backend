import 'dotenv/config'
import express, { json } from 'express'
import 'express-async-errors'
import morgan from 'morgan'
import cors from 'cors'
import ApiError from './errors/ApiError.js'
import { isAdmin, isOwner, verifyToken } from './middleware/auth.js'
import roleRoutes from './routes/role.js'
import userRoutes from './routes/user.js'

const app = express()

app.use(morgan('dev'))
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:8080'],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
    preflightContinue: false,
  })
)

app.use(json())
app.use('/client/check', verifyToken)
app.get('/admin/check', verifyToken, isAdmin, (req, res) => {
  return res.status(200).json({
    user: req.user,
  })
})

app.get('/owner/check', verifyToken, isOwner, (req, res) => {
  return res.status(200).json({
    user: req.user,
  })
})

app.use('/roles', verifyToken, isOwner, roleRoutes)
app.use('/users', userRoutes)

app.use((error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: error.message,
    })
  }

  console.log(error)

  res.status(500).json({
    error: 'Server error',
  })
})

export default app
