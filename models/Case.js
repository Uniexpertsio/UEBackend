const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    attributes: {
      type: String,
      url: String
    },
    accountId: String,
    id: String,
    caseNumber: String,
    origin: String,
    reason: String,
    case_Sub_Reason_c: String,
    isClosed:{ type: Boolean,default: false },
    isClosedOnCreate: {type: Boolean,default: false},
    description: String,
    priority: String,
    status: String,
    subject: String,
    type: String
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
