const mongoose = require("mongoose");

const CommissionModel = {
  FULL_FEES: "Full Fees",
  FEES_EXCLUDING_SCHOLARSHIP: "Fees (Excluding Scholarship)",
  FEES_PAID: "Fee’s Paid",
};

const CommissionTypeEnum = {
  COMMISSION: "Commission %",
  FIXED: "Fixed",
};


// removed givenTo type



const CommissionGivenTo = {
  PARTNER: "Partner",
};

const EducationLevel = {
  GRADE_12_HIGHER_SECONDARY_HIGH_SCHOOL: "Grade 12 , 12th Std , Higher Secondary , High School",
  YEAR_DIPLOMA_IN_TE: "3 Year Diploma in Technical Education /Vocational",
  YEAR_FOUNDATION_AT_UK_UNIVERSITY: "1 Year Foundation at UK University or Pathway Provider",
  POST_SECONDARY_CERTIFICATE: "Post Secondary Certificate [1 Year]",
  YEAR_UNDERGRADUATE_DEGREE_3: "3 Year Undergraduate Degree",
  YEAR_UNDERGRADUATE_DEGREE_4: "4 Year Undergraduate Degree",
  POST_GRADUATE_CERTIFICATE: "Post Graduate Certificate",
  POST_GRADUATE_DIPLOMA: "Post Graduate Diploma",
  MASTER_DEGREE: "Master Degree 1 or 2 Years",
  DOCTORATE_DEGREE: "Doctorate Degree",
  NOT_SPECIFIED_ABOVE: "Not Specified Above",
};

const CommissionTypeSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, required: false, default: true },
    schoolId: { type: String, required: true },
    programId: { type: String, required: true },
    intakeId: { type: String, required: true },
    agentId: { type: String, required: false },
    model: { type: String, required: true, enum: Object.values(CommissionModel) },
    type: { type: String, required: true, enum: Object.values(CommissionTypeEnum) },
    programLevel: { type: String, required: true, enum: Object.values(EducationLevel) },
    givenTo: { type: String, required: true, enum: Object.values(CommissionGivenTo) },
    commissionSlabIds: { type: [String], required: false, default: [] },
    externalId: { type: String, required: true },
    salesforceId: { type: String, required: false, default: "--" },
    createdBy: { type: String, required: true },
    modifiedBy: { type: String, required: true },
  },
  { timestamps: true }
);

CommissionTypeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});


module.exports = mongoose.model("CommissionType", CommissionTypeSchema);
