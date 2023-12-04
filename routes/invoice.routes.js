const express = require("express");
const {createInvoice, getInvoices} = require("../controllers/Invoice");
const Middleware = require("../controllers/Middleware")

const router = express.Router();

router.post('/api/invoice', Middleware.checkAuth, createInvoice);
router.get('/api/invoice', Middleware.checkAuth, getInvoices);

module.exports = router;