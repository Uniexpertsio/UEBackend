const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stage: { type: String, required: true, enum: ["Pre-Submission", "Application Submitted", "Accepted(Conditional)", "Accepted(Unconditional)", "Payment", "Visa Letter Requested", "Additional Documents Req.", "Visa Letter Approved", "Visa Applied", "Visa Approved", "Pre Departure", "Post-Arrival", "Commission", "Rejected"], default: "Pre-Submission" },

    status: { type: String, enum: ['New', 'Scheduled', 'In Progress', 'Rescheduled', 'Pending', 'Closed', 'Completed'], required: false, default: 'New' },
    responseType: { type: String, enum: ['Information', 'Document', 'Statement'], required: false, default: 'Statement' },
    description: { type: String, required: false },
    type: { type: String, enum: ['Question', 'Clarification', 'Request', 'Document', 'Pre - Screening', 'Interview', 'Verify', 'Documents', 'Appointment'], required: true },
    isRequired: { type: Boolean, required: false, default: true },
    publishToPortal: { type: Boolean, required: false, default: false },
    isReminderSet: { type: Boolean, required: false, default: false },
    isArchived: { type: Boolean, required: false, default: false },
    applicationId: { type: String, required: false },
    documentId: { type: String, required: false },
    documentTypeId: { type: String, required: false },
    studentId: { type: String, required: false },
    agentId: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], required: false, default: 'High' },
    createdBy: { type: String, required: true },
    externalId: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    comments: { type: [String], required: false, default: [] },
    completedAt: { type: Date, required: false },
    requestedInformation: { type: String, required: false },
    isLocked: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

taskSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;
