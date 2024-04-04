const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    contactName:String,
    accountName:String,
    caseId:{type:String,required:false},
    contactId: String,
    accountId: String,
    reason: String, // optional
    type: String,
    subType: String, //
    description: String,
    priority: String,
    subject: String,
    attachment: { type: String, required: false },
    status:{type:String,required:false,default:'New'},
    caseNumber:{type:String,required:false}
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Case = mongoose.model("Case", caseSchema);

module.exports = Case;
