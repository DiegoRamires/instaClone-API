const express = require('express')

const routes = new express.Router()

routes.get('/', (req, res) => {
  return res.send("Hello world")
})

module.exports = routes