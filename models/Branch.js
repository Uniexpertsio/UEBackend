const mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    countryCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    pincode: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    createdBy: { type: String, required: true },
    externalId: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    agentId: { type: String, required: true },
  },
  { timestamps: true }
);

BranchSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Branch", BranchSchema);