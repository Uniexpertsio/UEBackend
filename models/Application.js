const mongoose = require("mongoose");

const StageSchema = {
  key: { type: String, required: true },
  value: { type: Date, required: false, default: null },
};

const defaultFieldsOfStages = [
  {key: "Pre-Submission"},
  {key: "Application Submitted"},
  {key: "Accepted(Conditional)"},
  {key: "Accepted(Unconditional)"},
  {key: "Payment"},
  {key: "Visa Letter Requested"},
  {key: "Additional Documents Req."},
  {key: "Visa Letter Approved"},
  {key: "Visa Applied"},
  {key: "Visa Approved"},
  {key: "Pre Departure"},
  {key: "Post-Arrival"},
  {key: "Commission"},
  {key: "Rejected"}
]

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
    status: { type: String, required: false, default: "New" },
    stage: { type: String, required: true, default: "PRE_SUBMISSION" },
    stages: { type: [StageSchema], required: false, default: defaultFieldsOfStages },
    tasks: { type: [String], required: false, default: [] },
    comments: { type: [String], required: false, default: [] },
    documents: { type: [String], required: false, default: [] },
    payments: { type: [String], required: false, default: [] },
    createdBy: { type: String, required: true },
    externalId: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    salesforceId: { type: String, required: false, default: "--" },
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

module.exports = mongoose.model("Application", ApplicationSchema);
