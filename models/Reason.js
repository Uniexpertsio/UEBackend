const mongoose = require("mongoose");

const ReasonSchema = new mongoose.Schema(
  {
    label:{type:String},
    validFor: {
        type: [Number], // Indicates an array of numbers
    },
    value:{type:String}
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);
ReasonSchema.index({Name:'text'});
const Reason = mongoose.model("Reason", ReasonSchema);

module.exports = Reason;
