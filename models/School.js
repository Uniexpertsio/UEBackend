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
    Id: { type: String },
    Name: { type: String, required: true },
    Founded_Year__c: { type: Number },
    Features__c: { type: String },
    LegalName__c: { type: String },
    PartnerAccount__c: { type: String },
    VATNumber__c: { type: String },
    UniversityProposalSentDate__c: { type: String },
    NextFollowUpDate__c: { type: String },
    Tax__c: { type: Number },
    About__c: { type: String },
    ContractedCountries__c: { type: String },
    Location__c: { type: String },
    Address_Line1__c: { type: String },
    Address_Line2__c: { type: String },
    City__c: { type: String },
    Country__c: { type: String },
    Pincode__c: { type: String },
    Latitude__c: { type: String },
    Longitude__c: { type: String },
    Total_Students__c: { type: Number },
    International_Students__c: { type: Number },
    Minimum_work_history__c: { type: Number },
    Maximum_gap_allowed__c: { type: Number },
    Time_Ranking__c: { type: Number },
    QS_Ranking__c: { type: Number },
    DLI__c: { type: Number },
    Global_Ranking__c: { type: Number },
    Entry_Requirements__c: { type: String },
    Offer_Conditional_Admission__c: { type: Boolean },
    CurrencyIsoCode: { type: String },
    Is_Recommended__c: { type: Boolean },
    School_Rank__c: { type: Number },
    Academic_Percentage__c: { type: String },
    Duolingo__c: { type: String },
    IELTS_Requirement__c: { type: String },
    Sequence__c: { type: Number },
    Interview_Required__c: { type: String },
    MOI__c: { type: String },
    PTE_Requirement__c: { type: String },
    University_English_Test__c: { type: String },
    Logo__c: { type: String },
    waiver_on_class_12_English__c: { type: String },
    Avg_Cost_Of_Tuition_Year__c: { type: Number },
    Cost_Of_Living_Year__c: { type: Number },
    Application_Fee__c: { type: Number },
    Estimated_Total_Year__c: { type: Number },
    Duolingo_Conversation__c: { type: Number },
    Duolingo_Production__c: { type: Number },
    Duolingo_Comprehension__c: { type: Number },
    Duolingo_Overall__c: { type: Number },
    Duolingo_Percentile__c: { type: Number },
    Duolingo_Literacy__c: { type: Number },
    XII_Percentile__c: { type: Number },
    GMAT_Total_Marks_of_English__c: { type: Number },
    Xll_Total_Marks_of_English__c: { type: Number },
    GRE_Percentile__c: { type: Number },
    GMAT_Quantitative_Percentile__c: { type: Number },
    GMAT_Verbal_Score__c: { type: Number },
    GMAT_Integrated_Listening_Score__c: { type: Number },
    GMAT_Integrated_Listening_Percentile__c: { type: Number },
    GMAT_Verbal_Percentile__c: { type: Number },
    GMAT_Quantitative_Score__c: { type: Number },
    GMAT_Total_Percentile__c: { type: Number },
    GRE_Verbal_Reasoning_Percentile__c: { type: Number },
    GRE_Verbal_Reasoning_Score__c: { type: Number },
    GRE_Quantitative_reasoning_Score__c: { type: Number },
    GRE_Analytical_reasoning_Percentile__c: { type: Number },
    GRE_Analytical_reasoning_Score__c: { type: Number },
    TIP_Listening__c: { type: Number },
    TIP_Reading__c: { type: Number },
    TIP_Writing__c: { type: Number },
    TIP_Speaking__c: { type: Number },
    Lock_Record__c: { type: Boolean },
    Min_Percentage__c: { type: Number },
    Min_CGPA__c: { type: Number },
    Min_GPA__c: { type: Number },
    Min_Grade__c: { type: String },
    Min_Class__c: { type: String },
    Min_Score__c: { type: Number },
    Min_Division__c: { type: String },
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
