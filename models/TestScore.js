const mongoose = require("mongoose");

const KeyValueSchema = {
  key: { type: String, required: true },
  value: { type: String, required: true },
};

const VerificationPortalSchema = new mongoose.Schema({
  url: { type: String, required: false },
  username: { type: String, required: false },
  password: { type: String, required: false },
});

const TestScoreSchema = new mongoose.Schema(
  {
    examType: { type: String, required: true },
    doe: { type: Date, required: true },
    certificateNo: { type: String, required: true },
    showInProfile: { type: Boolean, required: false, default: true },
    scoreInformation: { type: [KeyValueSchema], required: true },
    studentId: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    trfId: { type: String, required: false, default: "--" },
    externalId: { type: String, required: true },
    createdBy: { type: String, required: true },
    isLocked: { type: Boolean, required: false, default: true },
    verificationPortal: { type: VerificationPortalSchema, required: false },
    totalMarks: { type: Number, required: true },
    testScoreSfId:{type:String,required:false},
    selectedType: { type: String, required: false }
  },
  { timestamps: true }
);

TestScoreSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("TestScore", TestScoreSchema);
