const mongoose = require("mongoose");

const KeyValueSchema = {
  key: { type: String, required: true },
  value: { type: String, required: true },
};

const DetailsSchema = {
  programLevel: {
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
  careerAdvisingAndTransitionServices: {
    type: Number,
    required: false,
    defaults: 0,
  },
};

const ProgramSchema = new mongoose.Schema(
  {
    Id: { type: String },
    Name: { type: String },
    CurrencyIsoCode: { type: String },
    School__c: { type: String, ref: "School" },
    Admission_Requirements__c: { type: String },
    Country__c: { type: String },
    Department__c: { type: String },
    Intake__c:{type:String},
    Master_Commission__c: { type: String },
    Program_level__c: { type: String },
    Scholarship__c: { type: String },
    University_Image__c: { type: String },
    Program_Description__c: { type: String },
    Admission_Requirements1__c: { type: String },
    International_Health_Insurance_Fee__c: { type: String },
    Career_Advising_and_Transition_Services__c: { type: String },
    Note__c: { type: String },
    Link__c: { type: String },
    Length__c: { type: String },
    Application_fee__c: { type: Number },
    Tuition__c: { type: Number },
    Cost_of_Living__c: { type: Number },
    Starting_Dates__c: { type: String },
    Submission_deadlines__c: { type: String },
    Status__c: { type: String },
    Delivery_Method__c:{type:String},
    Salesforce_Id__c: { type: String },
    Discipline__c: { type: String },
    ExternalId__c: { type: String },
    Sub_Discipline__c: { type: String },
    University_Id__c: { type: String },
    Average_Cost_Of_Tuition_Per_Year__c: { type: String },
    City__c: { type: String },
    Duolingo_Comprehension__c: { type: String },
    Duolingo_Conversation__c: { type: String },
    Delivery_Method__c: { type: String },
    Estimated_Total_Per_Year__c: { type: String },
    Icon__c: { type: String },
    IsRecommended__c: { type: Boolean },
    Duolingo_Overall__c: { type: String },
    Duolingo_Percentile__c: { type: String },
    Duolingo_Production__c: { type: String },
    Requirement_Exam_Type__c: { type: String },
    commission__c: { type: String },
    required_Program_Level__c: { type: String },
    GRE_Analytical_reasoning_Percentile__c: { type: String },
    GRE_Analytical_reasoning_Score__c: { type: String },
    GMAT_Quantitative_Score__c: { type: String },
    GRE_Percentile__c: { type: String },
    GMAT_Integrated_Listening_Percentile__c: { type: String },
    GMAT_Integrated_Listening_Score__c: { type: String },
    TIP_Listening__c: { type: String },
    Duolingo_Literacy__c: { type: String },
    GMAT_Quantitative_Percentile__c: { type: String },
    GRE_Quantitative_reasoning_Score__c: { type: String },
    TIP_Reading__c: { type: String },
    TIP_Speaking__c: { type: String },
    XII_Total_Marks_of_English__c: { type: String },
    GMAT_Total_Percentile__c: { type: String },
    GMAT_Verbal_Percentile__c: { type: String },
    GRE_Verbal_Reasoning_Percentile__c: { type: String },
    GRE_Verbal_Reasoning_Score__c: { type: String },
    GMAT_Verbal_Score__c: { type: String },
    TIP_Writing__c: { type: String },
    XIIth_Percentile__c: { type: String },
    GMAT_Total_Marks_of_English__c: { type: String },
    Offer_Conditional_Admission__c: { type: Boolean },
    Minimum_work_history__c: { type: String },
    Maximum_gap_allowed__c: { type: String },
    Time_Ranking__c: { type: String },
    QS_Ranking__c: { type: String },
    Global_Ranking__c: { type: String },
    Analytical_reasoning_Percentile__c: { type: String },
    Analytical_reasoning_Score__c: { type: String },
    Comprehension__c: { type: String },
    Conversation__c: { type: String },
    Integrated_Listening_Percentile__c: { type: String },
    Integrated_Listening_Score__c: { type: String },
    Listening__c: { type: String },
    Literacy__c: { type: String },
    Overall__c: { type: String },
    Percentile__c: { type: String },
    Production__c: { type: String },
    Quantitative_Percentile__c: { type: String },
    Quantitative_reasoning_Score__c: { type: String },
    Reading__c: { type: String },
    Speaking__c: { type: String },
    Total_Marks_of_English__c: { type: String },
    Total_Percentile__c: { type: String },
    Verbal_Percentile__c: { type: String },
    Verbal_Reasoning_Percentile__c: { type: String },
    Verbal_Reasoning_Score__c: { type: String },
    Verbal_Score__c: { type: String },
    Writing__c: { type: String },
    Required_Level__c: { type: String },
    Fast_Offer__c:{type:Boolean},
    Most_Chosen__c:{type:Boolean},
    Recommended__c:{type:Boolean},
    Top_Programs__c:{type:Number}

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
