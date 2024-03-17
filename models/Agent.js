const mongoose = require('mongoose');

const KeyValueDataSchema = {
    key: { type: String, required: true },
    value: { type: String, required: true },
    data: { type: String, required: true },
  };
  

const TimeZoneSchema = {
  time_zone: { type: String, required: true },
  name: { type: String, required: true },
  utc_offset: { type: String, required: true },
};

const AgentPersonalDetailsSchema = {
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  countryCode: { type: String, required: true },
  jobTitle: { type: String, required: true },
  timezone: { type: TimeZoneSchema, required: true, _id: false },
  isLocked: { type: Boolean, required: false, default: true },
};

const AddressSchema = {
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isLocked: { type: Boolean, required: false, default: true },
};

const AgentCompanySchema = {
  companyName: { type: String, required: true },
  companyLogo: { type: String, required: false },
  yearFounded: { type: String, required: true },
  studentPerYear: { type: String, required: true },
  entityType: { type: String, required: true },
  taxNumber: { type: String, required: true },
  country: { type: String, required: true },
  website: { type: String, required: false },
  whatsappId: { type: String, required: false },
  bdmUser: { type: String, required: false },
  verificationStatus: {
    type: String,
    required: false,
    enum: ["PENDING", "APPROVED" , "DEACTIVATED" ,"BLACKLISTED"],
    default: "PENDING",
  },
  isLocked: { type: Boolean, required: false, default: true },
};

const AgentBankSchema = {
  name: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  swiftCode: { type: String, required: true },
  extraField: { type: KeyValueDataSchema, required: false, _id: false },
  isLocked: { type: Boolean, required: false, default: true },
};

const AgentTncMetaSchema = {
  time: { type: Date, required: true },
  lat: { type: String, required: true },
  lng: { type: String, required: true },
  ip: { type: String, required: true },
  isAccepted: { type: Boolean, required: true },
  isLocked: { type: Boolean, required: false, default: true },
};

const AgentSchema = new mongoose.Schema(
  {
    personalDetails: {
      type: AgentPersonalDetailsSchema,
      required: true,
      _id: false,
    },
    address: { type: AddressSchema, required: true, _id: false },
    company: { type: AgentCompanySchema, required: true, _id: false },
    bank: { type: AgentBankSchema, required: true, _id: false },
    documents: { type: [String], required: false, default: [] },
    tncMeta: { type: AgentTncMetaSchema, required: false, _id: false },
    verificationStatus: {
      type: String,
      required: false,
      enum: ["PENDING", "IN_PROGRESS", "REJECTED", "APPROVED"],
      default: "PENDING",
    },
    accountManager: { type: String, required: false },
    commonId: { type: String, required: true, default: "A" },
    sf: { type: String, required: false },
    parentId: { type: String, required: false },
    currency: { type: String, required: false },
    maxActiveUsersAllowed: { type: Number, required: false, default: 5 },
    primaryStaffId: { type: String, required: false },
    partnerNotified: { type: Boolean, required: false },
    bypassDoc: { type: Boolean, required: false },
    finalDocStatus: { type: String, required: false },
    noOfEmployees: { type: Number, required: false },
    contactId:{type:String,required:false}
  },
  { timestamps: true }
);

AgentSchema.methods.getGeneralInformation = function () {
  const { personalDetails, address, company } = this;
  return { personalDetails, address, company };
};

AgentSchema.methods.getDocuments = function () {
  const { documents } = this;
  return documents;
};

AgentSchema.methods.getBankInformation = function () {
  const { bank } = this;
  return bank;
};

let Agent = mongoose.model("Agent", AgentSchema);

module.exports = Agent;
