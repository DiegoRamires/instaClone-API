const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

const app = express()
mongoose.connect('mongodb+srv://astro-9:star@cluster0-ahjnp.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
})

app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads', 'resized')))

app.use(require('./routes'))

app.listen(3000)
console.log('Server running on localhost:3000')
console.log('Hit `ctrl + c` to stop server')