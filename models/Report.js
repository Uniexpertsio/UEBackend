const mongoose  = require('mongoose');

const StaffNotificationSchema =new mongoose.Schema( {
    student: { type: Boolean, required: true },
    comments: { type: Boolean, required: true },
    commissions: { type: Boolean, required: true },
    agent: { type: Boolean, required: true },
    case: { type: Boolean, required: true },
    invoice: { type: Boolean, required: true },
    application: { type: Boolean, required: true },
    payments: { type: Boolean, required: true },
    schools: { type: Boolean, required: true },
    intake: { type: Boolean, required: true },
    document: { type: Boolean, required: true },
  });
  
  const StaffSchema = new mongoose.Schema(
    {
      fullName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String, required: true, unique: true },
      role: {
        type: String,
        required: true,
        enum: ["admin", "finance", "processing", "consultant"]
      },
      modules: { type: [String], required: true },
      password: { type: String, required: true },
      agentId: { type: String, required: true },
      passwordResetOtp: { type: String, required: false },
      notifications: { type: StaffNotificationSchema, required: false, _id: false },
      isActive: {
        type: Boolean,
        required: false,
        default: true,
      },
      dp: { type: String, required: false },
      description: { type: String, required: false },
      externalId: { type: String, required: false, default: "" },
      branchId: { type: String, required: false },
      sf: { type: String, required: false },
      docVerificationOfficer: { type: String, required: false },
      bdmUserId: { type: String, required: false },
      reportsToId: { type: String, required: false },
      partnerAccountId: { type: String, required: false },
      source: { type: String, required: false, default: 'Portal' },
      gender: { type: String, required: false, enum: ["Male", "Female", "Other"] },
      dob: { type: Date, required: false },
    },
    { timestamps: true }
  );


  const StageSchema = {
    key: { type: String, required: true },
    value: { type: Date, required: false, default: null },
  };
  
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
      status: { type: String, required: false, default: "NEW" },
      stage: { type: String, required: true, default: "PRE_SUBMISSION" },
      stages: { type: [StageSchema], required: false, default: [] },
      tasks: { type: [String], required: false, default: [] },
      comments: { type: [String], required: false, default: [] },
      documents: { type: [String], required: false, default: [] },
      payments: { type: [String], required: false, default: [] },
      createdBy: { type: String, required: true },
      externalId: { type: String, required: true },
      modifiedBy: { type: String, required: true },
    },
    { timestamps: true }
  );

  const CommissionStatus = {
    NEW: 'NEW',
    // Add other CommissionStatus values here
  };
  
  const CommissionSchema = new mongoose.Schema(
    {
      commissionTypeId: { type: String, required: true },
      status: { type: String, required: false, enum: Object.values(CommissionStatus), default: CommissionStatus.NEW },
      schoolId: { type: String, required: true },
      applicationId: { type: String, required: true },
      agentId: { type: String, required: true },
      commission: { type: Number, required: false },
      commissionRate: { type: Number, required: false },
      currency: { type: String, required: false },
      salesforceId: { type: String, required: false, default: '--' },
      externalId: { type: String, required: true },
      createdBy: { type: String, required: true },
      modifiedBy: { type: String, required: true },
    },
    { timestamps: true }
  );


const ReportSchema = new mongoose.Schema([
    { name: "Commission", schema: CommissionSchema },
    { name: "Staff", schema: StaffSchema },
    { name: "Application", schema: ApplicationSchema },
  ]);


  const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;