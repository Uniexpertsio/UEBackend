

const express = require('express');
const PaymentController = require('../controllers/Payment');

const router = express.Router();
const paymentController = new PaymentController();

router.post('/credit', paymentController.credit.bind(paymentController));
router.post('/withdraw', paymentController.withdraw.bind(paymentController));
router.get('/transactions', paymentController.getTransactions.bind(paymentController));
router.get('/account-summary', paymentController.accountSummary.bind(paymentController));
router.post('/verify-otp/:transactionId', paymentController.verifyOtp.bind(paymentController));

module.exports = router;
