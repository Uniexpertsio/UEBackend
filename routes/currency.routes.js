const CurrencyController = require("../controllers/Currency");
const express = require('express');
const Middleware = require("../controllers/Middleware")

const currencyController = new CurrencyController();

const router = express.Router();

router.get("/", Middleware.checkAuth, currencyController.getCurrencies.bind(currencyController))

module.exports = router;
