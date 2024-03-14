const mongoose = require("mongoose");

const FAQschema = new mongoose.Schema(
  {
    attributes: {
      type: { type: String },
      url: String,
    },
    Id: String,
    url: String,
    Name: String,
    Question__c: String,
    Answer__c: String,
    Type__c: String,
    URL__c: String,
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);
FAQschema.index({Name:'text'});
const FAQ = mongoose.model("faqs", FAQschema);

module.exports = FAQ;
