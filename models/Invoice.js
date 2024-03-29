// schema.js
const mongoose = require('mongoose');

const SupportedCurrencyEnum = ['INR', 'USD', 'UPI'];

const InvoiceSchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: SupportedCurrencyEnum, required: true },
    createdBy: { type: String, required: true },
    createdOn: { type: Date, required: true },
    approvedBy: { type: String, required: true },
    approvedOn: { type: Date, required: true },
    downloadLink: { type: String, required: true },
  },
  { timestamps: true }
);

InvoiceSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
