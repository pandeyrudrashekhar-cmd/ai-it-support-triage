const express = require('express')
const { createTriage } = require('../controllers/triageController')

const router = express.Router()

router.post('/', createTriage)

module.exports = router
