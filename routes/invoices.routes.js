const express = require('express')
const { generateInvoice } = require('../controllers/invoices.controller')
const ROUTER = express.Router()


ROUTER.post('/generate', generateInvoice)

module.exports = ROUTER
