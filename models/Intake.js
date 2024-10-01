const mongoose = require("mongoose");

const IntakeSchema = new mongoose.Schema(
  {
    "Id": { type: String, index: true },
    "Name": { type: String },
    "Programme__c": { type: String },
    "Months__c": { type: String },
    "Session__c": { type: String },
    "Status__c": { type: String },
    "Start_Date__c": { type: String },
    "End_Date__c": { type: String },
    "School__c": { type: String },
    "Enrollment_Deadline__c": { type: String }
  },
  { timestamps: true }
);

IntakeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Intake", IntakeSchema);
