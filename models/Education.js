const mongoose = require("mongoose");

const EducationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    level: { type: String, required: true },
    country: { type: String, required: true },
    institutionName: { type: String, required: true },
    affiliatedUniversity: { type: String, required: false },
    class: { type: String, required: false },
    isDegreeAwarded: { type: Boolean, required: true },
    degreeAwardedOn: { type: Date, required: false },
    attendedFrom: { type: Date, required: true },
    attendedTo: { type: Date, required: false },
    gpa: { type: String, required: false },
    cgpa: { type: String, required: false },
    grade: { type: String, required: false },
    studentId: { type: String, required: true },
    modifiedBy: { type: String, required: true },
    showInProfile: { type: Boolean, required: false, default: true },
    externalId: { type: String, required: true },
    createdBy: { type: String, required: true },
    instituteLanguage: { type: String, required: false },
    percentage: { type: String, required: false },
    gradingScheme: { type: String, required: true },
    score: { type: String, required: false },
    isLocked: { type: Boolean, required: false, default: true },
    educationSfId:{type:String,required:false}
  },
  { timestamps: true }
);

EducationSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Education = mongoose.model("Education", EducationSchema);

module.exports = Education;
