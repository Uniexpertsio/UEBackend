const cron = require("node-cron");

// Cron job to sync Frequently Asked Questions from Salesforce
cron.schedule("0 12 * * *", async () => {
  try {
    // Construct URL for Salesforce query
    const url = `${process.env.SF_QUERY_URL}?q=SELECT+Id,Name,Question__c,Type__c,Answer__c,URL__c+FROM+FrequentlyAskedQuestion__c+LIMIT+200`;
    
    // Fetch data from Salesforce
    const sfData = await getDataFromSF(url);

    if (sfData && sfData.records.length > 0) {
      // Process each record
      const operations = sfData.records.map(async (data) => {
        try {
          const filter = { Id: data.Id };
          const update = { $set: data };
          const options = { upsert: true };
          // Update or insert FAQ data
          await Faq.updateOne(filter, update, options);
        } catch (error) {
          console.error(`Error updating`, error);
        }
      });

      await Promise.all(operations);
      console.log("Data sync from Salesforce completed.");
    } else {
      console.log("No records found in Salesforce.");
    }
  } catch (error) {
    console.error("Error fetching data from Salesforce:", error);
  }
});

// Cron job to sync Cases from Salesforce
cron.schedule("0 12 * * *", async () => {
  try {
    // Construct URL for Salesforce query
    const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+ Id,ContactId,CaseNumber,AccountId,Reason,Subject,Priority,Description,Case_Sub_Reason__c,Attachment__c,Status,Account_Name__c,Contact_Name__c+FROM+case+where+ContactId+=+'${contactId}'`;
    
    // Fetch data from Salesforce
    const sfData = await getDataFromSF(url);
    
    if (sfData && sfData?.records?.length > 0) {
      // Process each record
      const operations = sfData.records.map(async (data) => {
        try {
          // Construct payload from Salesforce data
          const payload = {
            caseId: data?.Id,
            contactId: data?.ContactId,
            accountId: data?.AccountId,
            type: data?.Reason,
            subject: data?.Subject,
            priority: data?.Priority,
            description: data?.Description,
            subType: data?.Case_Sub_Reason__c,
            attachment: data?.Attachment__c,
            status: data?.Status,
            accountName: data?.Account_Name__c,
            contactName: data?.Contact_Name__c,
            caseNumber: data?.CaseNumber,
          };
          
          // Check if case exists in local database
          const ifExist = await Case.find({ caseId: data?.Id });
          
          if (ifExist && ifExist?.length > 0) {
            // Update existing case
            await Case.updateOne({ caseId: data?.Id }, payload);
          } else {
            // Create new case
            await new Case(payload).save();
          }

          console.log(`Successfully updated/inserted document with Id`);
        } catch (error) {
          console.error(`Error updating`, error);
        }
      });
      
      // Wait for all update operations to complete
      await Promise.all(operations);
    }
  } catch (error) {
    console.error("Error syncing cases from Salesforce:", error);
  }
});
