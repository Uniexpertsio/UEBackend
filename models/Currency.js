const mongoose = require("mongoose");

const CurrencySchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true },
    ratioToINR: { type: Number, required: true },
    sign: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

CurrencySchema.set("toJSON", {
  transform: function (document, returnedObject) {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Currency", CurrencySchema);
