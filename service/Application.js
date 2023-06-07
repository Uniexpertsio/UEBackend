const mongoose = require("mongoose");

const StageSchema = {
  key: { type: String, required: true, enum: ["Pre-Submission", "Application Submitted", "Accepted(Conditional)", "Accepted(Unconditional)", "Payment", "Visa Letter Requested", "Additional Documents Req.", "Visa Letter Approved", "Visa Applied", "Visa Approved", "Pre Departure", "Post-Arrival", "Commission", "Rejected"] },
  value: { type: Date, required: false, default: null },
};

const ApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: false, default: "--" },
    studentId: { type: String, required: true },
    schoolId: { type: String, required: true },
    programId: { type: String, required: true },
    agentId: { type: String, required: true },
    counsellorId: { type: String, required: false },
    processingOfficerId: { type: String, required: false },
    intakeId: { type: String, required: false },
    status: { type: String, required: false, enum: ["New", "Accepted", "Program Closed", "Withdrawn", "Cancelled", "Not Paid"], default: "New" },
    stage: { type: String, required: true, enum: ["Pre-Submission", "Application Submitted", "Accepted(Conditional)", "Accepted(Unconditional)", "Payment", "Visa Letter Requested", "Additional Documents Req.", "Visa Letter Approved", "Visa Applied", "Visa Approved", "Pre Departure", "Post-Arrival", "Commission", "Rejected"], default: "Pre-Submission" },
    stages: { type: [StageSchema], required: false, default: [], _id: false },
    tasks: { type: [String], required: false, default: [] },
    comments: { type: [String], required: false, default: [] },
    documents: { type: [String], required: false, default: [] },
    payments: { type: [String], required: false, default: [] },
    createdBy: { type: String, required: true },
    externalId: { type: String, required: true },
    modifiedBy: { type: String, required: true },
  },
  { timestamps: true }
);

ApplicationSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const ApplicationStatus = {
  NEW: "New",
  ACCEPTED: "Accepted",
  PROGRAM_CLOSED: "Program Closed",
  WITHDRAWN: "Withdrawn",
  CANCELLED: "Cancelled",
  NOT_PAID: "Not Paid",
};

const ApplicationStage = {
  PRE_SUBMISSION: "Pre-Submission",
  APPLICATION_SUBMITTED: "Application Submitted",
  ACCEPTED_CONDITIONAL: "Accepted(Conditional)",
  ACCEPTED_UNCONDITIONAL: "Accepted(Unconditional)",
  PAYMENT: "Payment",
  VISA_LETTER_REQUESTED: "Visa Letter Requested",
  ADDITIONAL_DOCUMENTS_REQ: "Additional Documents Req.",
  VISA_LETTER_APPROVED: "Visa Letter Approved",
  VISA_APPLIED: "Visa Applied",
  VISA_APPROVED: "Visa Approved",
  PRE_DEPARTURE: "Pre Departure",
  POST_ARRIVAL: "Post-Arrival",
  COMMISSION: "Commission",
  REJECTED: "Rejected",
};

module.exports = mongoose.model("Application", ApplicationSchema);
