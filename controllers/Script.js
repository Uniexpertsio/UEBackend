const { getDataFromSF } = require("../service/salesforce.service");
const { JSDOM } = require("jsdom");
const { URL } = require("url");
const School = require("../models/School");
const Program = require("../models/Program");

class ScriptController {
  // async schoolSync(req, res) {
  //   const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,ExternalId__c,Name,Founded_Year__c,Features__c,Logo__c,LegalName__c,VATNumber__c,UniversityProposalSentDate__c,NextFollowUpDate__c,Tax__c,About__c,ContractedCountries__c,Location__c,Address_Line1__c,Address_Line2__c,Country__c,Pincode__c,Latitude__c,Longitude__c,Total_Students__c,International_Students__c,Time_Ranking__c,QS_Ranking__c,DLI__c,Global_Ranking__c,Entry_Requirements__c,Offer_Conditional_Admission__c,CurrencyIsoCode,Is_Recommended__c,School_Rank__c,Academic_Percentage__c,Duolingo__c,IELTS_Requirement__c,Sequence__c,Interview_Required__c,MOI__c,PTE_Requirement__c,University_English_Test__c,waiver_on_class_12_English__c,Avg_Cost_Of_Tuition_Year__c,Cost_Of_Living_Year__c,Application_Fee__c,Estimated_Total_Year__c,GRE_Percentile__c,GMAT_Quantitative_Score__c,Fast_Offers__c,First_Choice_of_Students__c,Highest_Acceptance_Rate__c,No_IELTS_Required__c,Offers_in_48_Hrs__c,Recommended__c,Top_Hundred_School__c+FROM SCHOOL__C ORDER BY Name`;
  //   const data = await getDataFromSF(url);
  //   const replacableUrl='https://uniexperts.my.salesforce-sites.com/AccessImage/';
  //   // await School.deleteMany();
  //   // const result=await School.insertMany(data?.records);

  //   const newResult = data?.records?.map(async (item) => {
  //     if (item?.Logo__c != null) {
  //       const dom = new JSDOM(item?.Logo__c);
  //       // Access the img element within the div
  //       var imgElement = dom.window.document.querySelector("img");

  //       // Get the src attribute of the img element
  //       var srcValue = imgElement.getAttribute("src");
  //       // Split the URL by '&' to get individual parameters
  //       const logo=srcValue.replace("https://uniexperts.file.force.com/",replacableUrl);
  //       await School.insertMany({...item,Logo__c:logo})
  //       return data;
  //     }
  //     return null;
  //   });
  //   // const url='https://uniexperts.my.salesforce.com/services/data/v60.0/sobjects/SCHOOL__C/a005g00002sNGhoAAG/richTextImageFields/Logo__c/0EM5g000000oqVi';
  //   // const data= await getDataFromSF(url);
  //   // console.log(typeof data);
  //   // const logo=data.toString('base64')
  //   // const imageSchema = {
  //   //   image: {
  //   //     contentType: "image/png", // Replace with appropriate content type
  //   //     data: Buffer.from(data, "binary"), // Assuming data is a string
  //   //   },
  //   // };

  //   // console.log(imageSchema);
  //   // const updatedData = await School.updateOne(
  //   //   { _id: "6628e7e34936ff62af7814f4" },
  //   //   { $set: { Image_Logo: imageSchema ,Logo__c:logo} }
  //   // );
  //   // console.log(updatedData);
  //   return res.status(200).json(data);
  // }

  async schoolSync(req, res) {
    const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,ExternalId__c,Name,Founded_Year__c,Features__c,Logo__c,LegalName__c,VATNumber__c,UniversityProposalSentDate__c,NextFollowUpDate__c,Tax__c,About__c,ContractedCountries__c,Location__c,Address_Line1__c,Address_Line2__c,Country__c,Pincode__c,Latitude__c,Longitude__c,Total_Students__c,International_Students__c,Time_Ranking__c,QS_Ranking__c,DLI__c,Global_Ranking__c,Entry_Requirements__c,School_Type__c,Offer_Conditional_Admission__c,CurrencyIsoCode,Is_Recommended__c,School_Rank__c,Academic_Percentage__c,Duolingo__c,IELTS_Requirement__c,Sequence__c,Interview_Required__c,MOI__c,PTE_Requirement__c,University_English_Test__c,waiver_on_class_12_English__c,Avg_Cost_Of_Tuition_Year__c,Cost_Of_Living_Year__c,Application_Fee__c,Estimated_Total_Year__c,GRE_Percentile__c,GMAT_Quantitative_Score__c,Fast_Offers__c,First_Choice_of_Students__c,Highest_Acceptance_Rate__c,No_IELTS_Required__c,Offers_in_48_Hrs__c,Recommended__c,Top_Hundred_School__c+FROM SCHOOL__C ORDER BY Name`;
    const data = await getDataFromSF(url);
    console.log(data);
    await School.deleteMany();
    const replacableUrl =
      "https://uniexperts.my.salesforce-sites.com/AccessImage/";

    const processedData = data?.records
      ?.map((item) => {
        if (item?.Logo__c) {
          const dom = new JSDOM(item?.Logo__c);
          var imgElement = dom.window.document.querySelector("img");
          var srcValue = imgElement.getAttribute("src");
          const logo = srcValue.replace(
            "https://uniexperts.file.force.com/",
            replacableUrl
          );
          return { ...item, Logo__c: logo };
        } else {
          return item;
        }
      })
      .filter((item) => item); // Remove null elements

    await School.insertMany(processedData);
    const datarec = await School.find();
    return res.status(200).json(datarec);
  }

  async programSync(req, res) {
    const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,Name,CurrencyIsoCode,School__c,Admission_Requirements__c,Country__c,Department__c,Intake__c,Master_Commission__c,Program_level__c,Scholarship__c,University_Image__c,Program_Description__c,Admission_Requirements1__c,International_Health_Insurance_Fee__c,Career_Advising_and_Transition_Services__c,Note__c,Link__c,Length__c,Application_fee__c,Tuition__c,Cost_of_Living__c,Starting_Dates__c,Submission_deadlines__c,Status__c,Delivery_Method__c,Required_Level__c,Fast_Offer__c,Most_Chosen__c,Recommended__c,Top_Programs__c,Discipline__c,Sub_Discipline__c+FROM+Programme__c ORDER BY Name`;
    const result = await getDataFromSF(url);

    await Program.deleteMany();
    // const replacableUrl =
    //   "https://uniexperts.my.salesforce-sites.com/AccessImage/";

    // // const processedData = data?.records
    // //   ?.map((item) => {
    // //     if (item?.Logo__c) {
    // //       const dom = new JSDOM(item?.Logo__c);
    // //       var imgElement = dom.window.document.querySelector("img");
    // //       var srcValue = imgElement.getAttribute("src");
    // //       const logo = srcValue.replace(
    // //         "https://uniexperts.file.force.com/",
    // //         replacableUrl
    // //       );
    // //       return { ...item, Logo__c: logo };
    // //     } else {
    // //       return item;
    // //     }
    // //   })
    // //   .filter((item) => item); // Remove null elements

    await Program.insertMany(result?.records);
    // // const datarec = await Program.find();
    // const schoolIds = await School.find(
    //   { Country__c: "United Kingdom" },
    //   { Id: 1 }
    // );
    // const filteredId = schoolIds.map((item) => item.Id);
    const data = await Program.find();
    // const count = await Program.countDocuments({
    //   $and: { School__c: { $in: filteredId }, Program_level__c: "Grade 4" },
    // });
    // console.log(data, count);
    return res.status(200).json(data);
  }
}

module.exports = ScriptController;
