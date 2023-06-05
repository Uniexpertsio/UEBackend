const Currency = require("../models/Currency")

class CurrencyService {
  constructor(){}

  async getCurrencies() {
    return Currency.find({});
  }

  async getCurrency(symbol) {
    const currency = await Currency.findOne({ symbol });

    if (!currency) throw new Error("Currency not found");
    return currency;
  }
}

module.exports = CurrencyService;
