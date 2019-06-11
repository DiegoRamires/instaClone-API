const express = require('express')

const app = express()

app.get('/', (req, res) => {
  return res.send('Hello World')
})

app.listen(3000)
console.log('Server running on localhost:3000')
console.log('Hit `ctrl + c` to stop server')