const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    accountId: String,
    reason: String,// optional
    type:String,
    subType: String,//
    description: String,
    priority: String,
    subject: String,
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
