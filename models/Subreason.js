const mongoose = require("mongoose");

const SubreasonSchema = new mongoose.Schema(
    {
        label:{type:String},
        validFor: {
            type: [Number], // Indicates an array of numbers
        },
        value:{type:String}
      },
      { timestamps: true } // Adds createdAt and updatedAt fields
);
SubreasonSchema.index({Name:'text'});
const Subreason= mongoose.model("Subreason", SubreasonSchema);

module.exports = Subreason
