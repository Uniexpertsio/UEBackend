

const express = require('express');
const PaymentController = require('../controllers/Payment');
const Middleware = require("../controllers/Middleware");

const router = express.Router();
const paymentController = new PaymentController();

router.post('/credit', Middleware.checkAuth, paymentController.credit.bind(paymentController));
router.post('/withdraw', Middleware.checkAuth, paymentController.withdraw.bind(paymentController));
router.get('/transactions', Middleware.checkAuth, paymentController.getTransactions.bind(paymentController));
router.get('/account-summary', Middleware.checkAuth, paymentController.accountSummary.bind(paymentController));
router.post('/verify-otp/:transactionId', Middleware.checkAuth, paymentController.verifyOtp.bind(paymentController));

module.exports = router;
