const mongoose = require("mongoose");

const IntakeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    programId: { type: String, required: true },
    schoolId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    externalId: { type: String, required: true },
    status: { type: String, required: false, enum: ["Closed","Open","Closing soon",], default: "Open" },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
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
