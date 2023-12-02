// paymentController.js

const PaymentService = require('../service/payment.service');

class PaymentController {
  constructor() {
    this.paymentService = new PaymentService();
  }

  async credit(req, res) {
    try {
      const { agentId } = req.user;
      const paymentDto = req.body;
      const result = await this.paymentService.credit(agentId, paymentDto);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async withdraw(req, res) {
    try {
      const { agentId } = req.user;
      const paymentWithdrawalDto = req.body;
      const result = await this.paymentService.withdraw(agentId, paymentWithdrawalDto);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTransactions(req, res) {
    try {
      const { agentId } = req.user;
      const query = req.query;
      const result = await this.paymentService.getTransactions(agentId, query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async accountSummary(req, res) {
    try {
      const { agentId } = req.user;
      const query = req.query;
      const result = await this.paymentService.accountSummary(agentId, query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async verifyOtp(req, res) {
    try {
      const { agentId } = req.user;
      const { transactionId } = req.params;
      const verifyTransactionOtp = req.body;
      const result = await this.paymentService.verifyOtp(agentId, transactionId, verifyTransactionOtp);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PaymentController;
