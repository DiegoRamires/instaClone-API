const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')

const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

mongoose.connect('mongodb+srv://astro-9:star@cluster0-ahjnp.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
})

app.use((req, res, next) => {
  req.io = io

  next()
})

app.use(cors())

app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads', 'resized')))

app.use(require('./routes'))

server.listen(process.env.PORT || 3001, process.env.IP, function() {
  console.log("The App server is running!")
  console.log("Access http://localhost:3001 on development mode")
  console.log("Hit ctrl + c to stop!")
})