const mongoose = require("mongoose");

const DocumentTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactRecordType: {
      type: String,
      required: true,
      enum: [
        "Student",
        "Partner"
      ],
    },
    category: { type: String, required: true, enum: [
        "Personal",
        "Professional",
        "Educational",
        "Educational Others",
        "Test Results",
        "Financial",
        "Medical",
        "Visa Related Docs",
        "Enrolment",
        "Offer",
        "Rejection",
        "Partner Documents"
      ] },
    isActive: { type: Boolean, required: true },
    description: { type: String, required: false },
    isMandatory: { type: Boolean, required: true },
    country: { type: [String], required: true },
    sequence: { type: Number, required: false, default: 0 },
    objectType: { type: String, required: true, enum: [
        "Application",
        "Student",
      ] },
    externalId: { type: String, required: true },
    isBypass: { type: Boolean, required: false }
  },
  { timestamps: true }
);

DocumentTypeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const DocumentType = mongoose.model('DocumentType', DocumentTypeSchema);

module.exports = DocumentType;
