const CurrencyController = require("../controllers/Currency");
const express = require('express');
const currencyController = new CurrencyController();

const router = express.Router();

router.get("/", currencyController.getCurrencies())

module.exports = router;


