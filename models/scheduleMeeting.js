const mongoose = require("mongoose");

const MeetingReason = ["Onboarding Related", "Support", "Know The Platform"];

const scheduleMeetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    reason: { type: String, required: true, enum: MeetingReason },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    creatorId: { type: String, required: true },
    salesforceId: {type: String}
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);
const ScheduleMeeting = mongoose.model("ScheduleMeeting", scheduleMeetingSchema);

module.exports = ScheduleMeeting;
