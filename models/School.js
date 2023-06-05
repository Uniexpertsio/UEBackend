const mongoose = require("mongoose");

const AddressSchema = {
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isLocked: { type: Boolean, required: false, default: true },
};


const SchoolBasicDetailSchema = {
  images: { type: [String], required: false, default: [] },
  logo: { type: String, required: false },
  dil: { type: String, required: false },
  name: { type: String, required: true },
  schoolId: { type: String, required: true },
  foundedYear: { type: Number, required: true },
  schoolType: { type: String, required: true },
  totalStudents: { type: Number, required: false, default: 0 },
  internationStudents: { type: Number, required: false, default: 0 },
};

const SchoolFeatureSchema = {
  icon: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  readMore: { type: String, required: false, default: "" },
};

const SchoolFinancialDescriptionSchema = {
  avgCostOfTuitionPerYear: { type: String, required: true },
  applicationFees: { type: String, required: true },
  costOfLivingPerYear: { type: String, required: true },
  estimatedTotalPerYear: { type: String, required: true },
};

const SchoolSchema = new mongoose.Schema(
  {
    basicDetails: {
      type: SchoolBasicDetailSchema,
      required: true,
      _id: false,
    },
    address: {
      type: AddressSchema,
      required: true,
      _id: false,
    },
    about: { type: String, required: true },
    features: {
      type: [SchoolFeatureSchema],
      required: true,
      _id: false,
    },
    financialDescription: {
      type: SchoolFinancialDescriptionSchema,
      required: true,
      _id: false,
    },
    programmes: { type: [String], required: false, default: [] },
    entryRequirements: { type: [String], required: false, default: [] },
    isRecommended: { type: Boolean, required: false, default: false },
    sequence: { type: Number, required: false, default: 0 },
    schoolRank: { type: Number, required: false, default: 0 },
    createdBy: { type: String, required: true },
    externalId: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    offerConditionalAdmission: { type: Boolean, required: false, default: false },
    currency: { type: String, required: false, default: "USD" },
  },
  { timestamps: true }
);

SchoolSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.programmes;
  },
});

const School = mongoose.model("School", SchoolSchema);

module.exports = School;
