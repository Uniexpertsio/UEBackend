const mongoose = require("mongoose");

const KeyValueSchema = {
    key: { type: String, required: true },
    value: { type: String, required: true },
  };

const DetailsSchema = {
  programLevel: { type: String, required: false, enum: [
    "Grade 12 , 12th Std , Higher Secondary , High School",
    "3 Year Diploma in Technical Education /Vocational",
    "1 Year Foundation at UK University or Pathway Provider",
    "Post Secondary Certificate [1 Year]",
    "3 Year Undergraduate Degree",
    "4 Year Undergraduate Degree",
    "Post Graduate Certificate",
    "Post Graduate Diploma",
    "Master Degree 1 or 2 Years",
    "Doctorate Degree",
    "Not Specified Above",
  ], default: "Doctorate Degree" },
  requiredProgramLevel: {
    type: String,
    required: false,
    enum: [
      "Grade 12 , 12th Std , Higher Secondary , High School",
      "3 Year Diploma in Technical Education /Vocational",
      "1 Year Foundation at UK University or Pathway Provider",
      "Post Secondary Certificate [1 Year]",
      "3 Year Undergraduate Degree",
      "4 Year Undergraduate Degree",
      "Post Graduate Certificate",
      "Post Graduate Diploma",
      "Master Degree 1 or 2 Years",
      "Doctorate Degree",
      "Not Specified Above",
    ],
    default: "Doctorate Degree",
  },
  length: { type: Number, required: false },
  admissionStatus: { type: String, required: false },
};

const ApplicationDateSchema = {
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  status: { type: String, required: false },
};

const CostSchema = {
  tuitionFees: { type: Number, required: false },
  applicationFees: { type: Number, required: false },
  commission: { type: Number, required: false },
  costOfLiving: { type: Number, required: false },
};

const AboutProgramSchema = {
  description: { type: String, required: false },
  details: { type: DetailsSchema, required: true },
  cost: { type: CostSchema, required: true },
  applicationDates: { type: [ApplicationDateSchema], required: true },
};

const FeeSchema = {
  avgCostOfTuitionPerYear: { type: Number, required: true },
  applicationFees: { type: Number, required: true },
  costOfLivingPerYear: { type: Number, required: true },
  estimatedTotalPerYear: { type: Number, required: true },
  internationalHealthInsurance: { type: Number, required: false, defaults: 0 },
  careerAdvisingAndTransitionServices: { type: Number, required: false, defaults: 0 },
};

const ProgramSchema = new mongoose.Schema(
  {
    about: { type: AboutProgramSchema, required: false },
    requirements: { type: [String], required: false },
    fee: { type: FeeSchema, required: false },
    name: { type: String, required: false },
    city: { type: String, required: false },
    icon: { type: String, required: false },
    isRecommended: { type: Boolean, required: false, default: false },
    discipline: { type: String, required: true },
    subDiscipline: { type: String, required: true },
    country: { type: String, required: true },
    createdBy: { type: String, required: true },
    externalId: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    schoolId: { type: String, required: true },
    requirementExamType: { type: String, required: true },
    requirementScoreInformation: { type: [KeyValueSchema], required: false, default: [] },
    deliveryMethod: {
      type: String,
      required: false,
      enum: ["Online", "Offline"],
      default: "Offline",
    },
  },
  { timestamps: true }
);

ProgramSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Program", ProgramSchema);
