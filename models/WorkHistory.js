const mongoose = require("mongoose");

const SigningAuthoritySchema = new mongoose.Schema({
  name: { type: String, required: false },
  phone: { type: String, required: false },
  email: { type: String, required: false },
});

const WorkHistorySchema = new mongoose.Schema(
  {
    employerName: { type: String, required: true },
    designation: { type: String, required: true },
    doj: { type: Date, required: true },
    dor: { type: Date, required: true },
    countryCode:{ type: String, required: true },
    contactInfo: { type: String, required: false },
    signedPersonCountryCode:{ type: String, required: true },
    signedPersonPhone:{ type: String, required: true },
    email: { type: String, required: false },
    studentId: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    showInProfile: { type: Boolean, required: false, default: true },
    externalId: { type: String, required: true },
    createdBy: { type: String, required: true },
    isLocked: { type: Boolean, required: false, default: true },
    signingAuthority: { type: SigningAuthoritySchema, required: false, _id: false },
    WorkHistorySfId:{type:String,required:false}
  },
  { timestamps: true }
);

WorkHistorySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const SigningAuthority = mongoose.model("SigningAuthority", SigningAuthoritySchema);
const WorkHistory = mongoose.model("WorkHistory", WorkHistorySchema);

module.exports = WorkHistory;
