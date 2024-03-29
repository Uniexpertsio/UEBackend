const PaymentModel = require("../models/Payment");
const Currency = require("../models/Currency");

class PaymentService {

  async convertInINR(amount, symbol) {
    const currency = await Currency.findOne({ symbol });
    if (!currency) {
      throw new Error(`${symbol}: currency not supported.`);
    }
    return currency.ratioToINR * amount;
  }

  async credit(agentId, paymentDto) {
    const amountInINR = await this.convertInINR(paymentDto.amount, paymentDto.currency);

    const payment = await PaymentModel.create({
      ...paymentDto,
      amountInINR: amountInINR,
      amount: paymentDto.amount,
      agentId,
      paymentType: "CREDIT",
      status: "SUCCESS",
      createdAt: new Date(paymentDto.date).toISOString(),
    });

    // Uncomment the following lines when sendToSF method is implemented
    // this.salesforceService.sendToSF(MappingFiles.SCHOOL_programme, {
    //   ...payment,
    //   schoolId: (await this.schoolService.findById(program.schoolId)).externalId,
    //   _user: { id }
    // });

    return payment.save();
  }

  async getAvailableCredit(agentId) {
    const credits = await PaymentModel.find({ agentId, paymentType: "CREDIT" });
    return credits.reduce((total, credit) => total + credit.amount, 0);
  }

  async sendTransactionOtp(transactionId) {
    // Implement the logic to send OTP (not provided in the original code)
    // For example, you can generate an OTP and update the transaction with it
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();
    await PaymentModel.updateOne({ _id: transactionId }, { $set: { otp: OTP } });
  }

  async withdraw(agentId, paymentWithdrawalDto) {
    const availableCredit = await this.getAvailableCredit(agentId);
    const withdrawAmountInINR = await this.convertInINR(paymentWithdrawalDto.amount, paymentWithdrawalDto.currency);

    if (availableCredit < withdrawAmountInINR) {
      throw new Error("Insufficient credit.");
    }

    const payment = await PaymentModel.create({
      ...paymentWithdrawalDto,
      agentId,
      amountInINR: withdrawAmountInINR,
      paymentType: "WITHDRAW",
      status: "PROGRESS",
      paymentMode: "BANK_TRANSFER",
      bankName: "-",
    });

    await this.sendTransactionOtp(payment._id);

    return payment.save();
  }

  async getTransactions(agentId, query) {
    // Implement the logic to get transactions based on the query
    const filter = { agentId, status: { $ne: PaymentStatus.PROGRESS } };

    if (query.startDate !== DEFAULT_NULL_DATE_PAST && query.endDate !== DEFAULT_NULL_DATE_PAST) {
      filter.createdAt = {
        $gte: new Date(query.startDate).toISOString(),
        $lte: new Date(query.endDate).toISOString(),
      };
    }

    const transactions = await PaymentModel
      .find(filter)
      .skip(query.perPage * (query.pageNo - 1))
      .limit(query.perPage);

    return {
      data: transactions,
      meta: {
        perPage: query.perPage,
        pageNo: query.pageNo,
        total: (await PaymentModel.find(filter)).length,
      },
    };
  }

  async accountSummary(agentId, query) {
    // Implement the logic to get account summary based on the query
    const transactions = await PaymentModel.find({ agentId });

    const credits = transactions.filter(
      (t) =>
        t.paymentType === "CREDIT" && t.status !== "FAILED" && t.status !== "PROGRESS"
    );
    const withdraws = transactions.filter(
      (t) =>
        t.paymentType === "WITHDRAW" &&
        t.status !== "FAILED" &&
        t.status !== "PROGRESS"
    );

    const totalEarned = credits.reduce((total, credit) => total + credit.amountInINR, 0);
    const totalWithdrawn = withdraws.reduce((total, withdraw) => total + withdraw.amountInINR, 0);

    const currencyInformation = await Currency.findOne({ symbol: query.currency });

    if (!currencyInformation) {
      throw new Error("Invalid currency provided.");
    }

    const totalEarnedInCurrencyAsked = totalEarned / currencyInformation.ratioToINR;
    const totalWithdrawnInCurrencyAsked = totalWithdrawn / currencyInformation.ratioToINR;
    const currentWalletAmountInCurrencyAsked = totalEarnedInCurrencyAsked - totalWithdrawnInCurrencyAsked;

    return {
      totalEarned: totalEarnedInCurrencyAsked,
      totalWithdrawn: totalWithdrawnInCurrencyAsked,
      currentWalletAmount: currentWalletAmountInCurrencyAsked,
      currency: query.currency,
    };
  }

  async verifyOtp(agentId, transactionId, verifyTransactionOtp) {
    const transaction = await PaymentModel.findById(transactionId);

    if (transaction && transaction.otp === verifyTransactionOtp.otp) {
      await PaymentModel.updateOne({ _id: transactionId }, { $set: { status: "SUCCESS" } });
      return PaymentModel.findById(transactionId);
    }

    throw new Error("Incorrect OTP provided for transaction.");
  }

  async getPaymentsCount(agentId) {
    return (await PaymentModel.find({ agentId })).length;
  }
}

module.exports = PaymentService;
