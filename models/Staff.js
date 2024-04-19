const mongoose = require("mongoose");

const StaffNotificationSchema = {
  student: { type: Boolean, required: true },
  comments: { type: Boolean, required: true },
  commissions: { type: Boolean, required: true },
  agent: { type: Boolean, required: true },
  case: { type: Boolean, required: true },
  invoice: { type: Boolean, required: true },
  application: { type: Boolean, required: true },
  payments: { type: Boolean, required: true },
  schools: { type: Boolean, required: true },
  intake: { type: Boolean, required: true },
  document: { type: Boolean, required: true },
};

const StaffSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "finance", "processing", "consultant"],
    },
    modules: { type: [String], required: true },
    password: { type: String, required: true },
    agentId: { type: String, required: true },
    passwordResetOtp: { type: String, required: false },
    notifications: {
      type: StaffNotificationSchema,
      required: false,
      _id: false,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    dp: { type: String, required: false },
    description: { type: String, required: false },
    externalId: { type: String, required: false, default: "" },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch", // Assuming your branch model is named 'Branch'
    },
    sfId: { type: String, required: false },
    docVerificationOfficer: { type: String, required: false },
    bdmUserId: { type: String, required: false },
    reportsToId: { type: String, required: false },
    partnerAccountId: { type: String, required: false },
    source: { type: String, required: false, default: "Portal" },
    gender: {
      type: String,
      required: false,
      enum: ["Male", "Female", "Other"],
    },
    dob: { type: Date, required: false },
    countryCode: { type: String, required: false },
    lastLoginDate: { type: Date, required: false },
  },
  { timestamps: true }
);

let staffModel = mongoose.model("Staff", StaffSchema);
module.exports = staffModel;
