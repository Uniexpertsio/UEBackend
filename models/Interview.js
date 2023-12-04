const mongoose = require('mongoose');

const InterviewReason = ["Onboarding Related", "Support", "Know The Platform"];
const CreatorType = ["AGENT", "ADMIN"];
const InterviewType = ["PARTNER_SUPPORT", "PRE_SCREENING", "CREDIBILITY_INTERVIEW", "MOCK_PRE_SCREENING", "MOCK_CREDIBILITY_INTERVIEW"];
const InterviewTool = ["MICROSOFT_TEAMS"];

const InterviewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creatorId: { type: String, required: true },
    creatorType: { type: String, required: true, enum: CreatorType },
    reason: { type: String, required: true, enum: InterviewReason },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    staffIds: { type: [String], required: false, default: [] },
    studentIds: { type: [String], required: false, default: [] },
    tool: { type: String, required: false, enum: InterviewTool, default: InterviewTool[0] },
    type: { type: String, required: false, enum: InterviewType, default: InterviewType[0] },
    link: { type: String, required: false },
    applicationId: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', InterviewSchema);
