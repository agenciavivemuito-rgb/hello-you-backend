import app from './server.js'

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
})
