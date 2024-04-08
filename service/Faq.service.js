const Faq = require("../models/FAQ");
const { getDataFromSF } = require("../service/salesforce.service");

async function getFaqData(query) {
  try {
    if (query) {
      const regex = new RegExp(query, 'i'); // 'i' flag for case-insensitive search
      const data = await Faq.find({ Question__c: { $regex: regex } });
      return data;
    } else {
      const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,Name,Question__c,Type__c,Answer__c,URL__c+FROM+FrequentlyAskedQuestion__c+LIMIT+200`;
      const sfData = await getDataFromSF(url);

      if (sfData && sfData?.records?.length > 0) {
        const operations = sfData.records.map(async (data) => {
          try {
            const filter = { Id: data.Id };
            const update = { $set: data };
            const options = { upsert: true };
            await Faq.updateOne(filter, update, options);
            console.log(`Successfully updated/inserted document with Id`);
          } catch (error) {
            console.error(`Error updating`, error);
          }
        });

        // Wait for all update operations to complete
        await Promise.all(operations);

        // Fetch and return the updated data from MongoDB
        const updatedData = await Faq.find();
        return updatedData;
      } else {
        console.log("No records found in Salesforce.");
      }
    }
  } catch (error) {
    console.error("Error fetching data from Salesforce:", error);
  }
}

module.exports = {
  getFaqData,
};
