const mongoose = require("mongoose");

const CommissionSlabSchema = new mongoose.Schema(
  {
    commissionTypeId: { type: String, required: true },
    fixedCommission: { type: Number, required: false },
    min: { type: Number, required: false },
    max: { type: Number, required: false },
    commissionRate: { type: Number, required: false },
    currency: { type: String, required: false },
    externalId: { type: String, required: true },
    salesforceId: { type: String, required: false, default: "--" },
    createdBy: { type: String, required: true },
    modifiedBy: { type: String, required: true },
  },
  { timestamps: true }
);

CommissionSlabSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const CommissionSlab = mongoose.model("CommissionSlab", CommissionSlabSchema);

module.exports = CommissionSlab;