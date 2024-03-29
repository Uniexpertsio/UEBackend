const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const StudentPaymentSchema = new Schema(
  {
    paymentName: { type: String, required: false, default: "--" },
    studentId: { type: String, required: true },
    schoolId: { type: String, required: true },
    applicationId: { type: String, required: true },
    programmeId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["New", "Paid", "Rejected"], required: false, default: "New" },
    type: { type: String, enum: ["Application Fee", "Tuition Fee", "Others"], required: false, default: "Tuition Fee" },
    createdBy: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    externalId: { type: String, required: true },
    isLocked: { type: Boolean, required: false, default: true },
  },
  { timestamps: true }
);

StudentPaymentSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const StudentPayment = model("StudentPayment", StudentPaymentSchema);

module.exports = StudentPayment;
