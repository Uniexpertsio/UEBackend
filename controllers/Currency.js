const CurrencyService = require('../service/currency.service');

class CurrencyController {
  constructor() {
    this.currencyService = new CurrencyService();
  }

  async getCurrencies(req, res) {
    return this.currencyService.getCurrencies();
  }
}

module.exports = CurrencyController;
