const mongoose = require('mongoose');

const FAQschema = new mongoose.Schema(
    {
        type: { type: String, default: 'FrequentlyAskedQuestion__c' },
        id: String,
        url: String,
        name: String,
        question__c: String,
        solution__c: String,
        category__c: String,
        subCategory__c: String,
        type_c: String,
        descriptive_Answer__c: String,
        url_c: String
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

const FAQ = mongoose.model('Case', FAQschema);

module.exports = FAQ;
