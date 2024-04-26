const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  agentId: { type: String, required: true },
  // bankName: { type: String, required: true },
  // paymentMode: { type: String, required: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  // amountInINR: { type: Number, required: true },
  // status: { type: String, required: true },
  // paymentType: { type: String, required: true },
  // transactionId: { type: String, required: false },
  // otp: { type: String, required: false },
  type: { type: String, required: false },
  applicationId: { type: String, required: false },
  college: { type: String, required: false },
  studentId: { type: String, required: false },
  programId: { type: String, required: false },
  paymentDate: { type: Date }
}, {timestamps: true});

const PaymentModel = mongoose.model('Payment', PaymentSchema);

const transformToJSON = (document) => {
  const returnedObject = { ...document };
  returnedObject.id = returnedObject._id.toString();
  delete returnedObject._id;
  delete returnedObject.__v;
  delete returnedObject.amountInINR;
  delete returnedObject.otp;
  return returnedObject;
};

module.exports = PaymentModel;