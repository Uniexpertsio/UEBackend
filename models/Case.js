const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    accountName: { type: String, required: true },
    contactName: { type: String, required: true },
    origin: { type: String, required: false },
    type: { type: String, required: true },
    subType: { type: String },
    description: { type: String },
    comments: { type: String },
    priority: { type: String, required: true },
    status: { type: String, default: 'New'},
    subject: { type: String },
    attachment: { type: String}
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
