const mongoose = require("mongoose");

/// schema matching to be confirmed from nilesh

const AddressSchema = {
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isLocked: { type: Boolean, required: false, default: true },
};

const StudentInformationSchema = {
  salutation: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String, required: false },
  lastName: { type: String, required: true },
  staffId: { type: String, required: false },
  counsellorId: { type: String, required: false },
  source: { type: String, required: true },
  passportNumber: { type: String, required: true },
  mobileCountryCode: { type: String, required: true },
  mobile: { type: String, required: true },
  whatsappCountryCode: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  preferredCountry: { type: [String], required: true },
  intakePreferred: { type: String, required: false },
  email: { type: String, required: false },
  dp: { type: String, required: false },
  isLocked: { type: Boolean, required: false, default: true },
  processingOfficer: { type: String, required: false },
};

const DemographicInformationSchema = {
  medicalHistoryDetails: { type: String, required: false },
  haveMedicalHistory: { type: Boolean, required: true, default: false },
  maritalStatus: { type: String, required: true },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  firstLanguage: { type: String, required: true },
  country: { type: String, required: true },
  isLocked: { type: Boolean, required: false, default: true },
};

const EmergencyContactSchema = {
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  email: { type: String, required: true },
  countryCode: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: false },
  country: { type: String, required: true },
  isLocked: { type: Boolean, required: false, default: true },
};

const BackgroundInformationSchema = {
  isRefusedVisa: { type: Boolean, required: true },
  visaRefusalInformation: { type: String, required: false },
  haveStudyPermit: { type: String, required: true, default: "No" },
  studyPermitDetails: { type: String, required: false },
  isLocked: { type: Boolean, required: false, default: true },
};

const StudentSchema = new mongoose.Schema(
  {
    studentInformation: {
      type: StudentInformationSchema,
      required: true,
      _id: false,
    },
    demographicInformation: {
      type: DemographicInformationSchema,
      required: true,
      _id: false,
    },
    address: { type: AddressSchema, required: false, _id: false },
    emergencyContact: {
      type: EmergencyContactSchema,
      required: false,
      _id: false,
    },
    backgroundInformation: {
      type: BackgroundInformationSchema,
      required: false,
      _id: false,
    },
    educations: {
      type: [String],
      required: false,
      default: [],
    },
    documents: {
      type: [String],
      required: false,
      default: [],
    },
    workHistory: {
      type: [String],
      required: false,
      default: [],
    },
    testScore: {
      type: [String],
      required: false,
      default: [],
    },
    payment: {
      type: [String],
      required: false,
      default: [],
    },
    tasks: {
      type: [String],
      required: false,
      default: [],
    },
    comments: {
      type: [String],
      required: false,
      default: [],
    },
    modifiedBy: { type: String, required: true },
    agentId: { type: String, required: false, default: "" },
    salesforceId: { type: String, required: false, default: "--" },
    externalId: { type: String, required: false, default: "" },
    createdBy: { type: String, required: false },
    noWorkHistory: {type: Boolean, default: false},
    currentStage: { type: Number, required: false, default: 0 },
    partnerId: { type: String, required: false },
  },
  { timestamps: true }
);

StudentSchema.methods.getGeneralInformation = function () {
  const {
    studentInformation,
    demographicInformation,
    address,
    emergencyContact,
    backgroundInformation,
  } = this;
  return {
    studentInformation,
    demographicInformation,
    address,
    emergencyContact,
    backgroundInformation,
  };
};

const MaritalStatus = {
  MARRIED: "Married",
  UNMARRIED: "Unmarried",
  DIVORCED: "Divorced",
};

const Gender = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

const Salutation = {
  MR: "Mr.",
  MS: "Ms.",
  MRS: "Mrs.",
  DR: "Dr.",
  PROF: "Prof.",
};

const Relationship = {
  FATHER: "Father",
  MOTHER: "Mother",
  BROTHER: "Brother",
  SISTER: "Sister",
  NEIGHBOUR: "Neighbour",
  RELATIVE: "Relative",
  OTHER: "Other",
};

const StudentSource = {
  PARTNER: "Partner",
  INTERNAL: "Internal",
  INBOUND: "Inbound",
  EXHIBITION: "Exhibition",
  SALES: "Sales",
  WEBSITE: "Website",
  WALK_IN: "Walk-in",
};

const StudyPermit = {
  NO: "No",
  Professional: "USA F1 VISA",
  Educational: "Canadian Study Permit or Visitor Visa",
  EducationalOthers: "UK Student Visa (Tier 4) or Short Term Study Visa",
  TestResults: "Australian Study Visa",
};

module.exports = mongoose.model("Student", StudentSchema);
