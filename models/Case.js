const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    AccountId: { type: String, required: true },
    ContactId: { type: String, required: true },
    Origin: { type: String, required: true },
    Reason: { type: String, required: true },
    Case_Sub_Reason__c: { type: String },
    Description: { type: String },
    Comments: { type: String },
    Priority: { type: String, required: true },
    Status: { type: String, required: true },
    Subject: { type: String },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
