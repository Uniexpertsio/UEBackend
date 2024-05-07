const { getDataFromSF } = require("../service/salesforce.service");
const { JSDOM } = require("jsdom");
const { URL } = require("url");

class ScriptController {
  async schoolSync(req, res) {
    const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,ExternalId__c,Name,Founded_Year__c,Features__c,Logo__c,LegalName__c,VATNumber__c,UniversityProposalSentDate__c,NextFollowUpDate__c,Tax__c,About__c,ContractedCountries__c,Location__c,Address_Line1__c,Address_Line2__c,Country__c,Pincode__c,Latitude__c,Longitude__c,Total_Students__c,International_Students__c,Time_Ranking__c,QS_Ranking__c,DLI__c,Global_Ranking__c,Entry_Requirements__c,Offer_Conditional_Admission__c,CurrencyIsoCode,Is_Recommended__c,School_Rank__c,Academic_Percentage__c,Duolingo__c,IELTS_Requirement__c,Sequence__c,Interview_Required__c,MOI__c,PTE_Requirement__c,University_English_Test__c,waiver_on_class_12_English__c,Avg_Cost_Of_Tuition_Year__c,Cost_Of_Living_Year__c,Application_Fee__c,Estimated_Total_Year__c,GRE_Percentile__c,GMAT_Quantitative_Score__c+FROM SCHOOL__C ORDER BY Name `;
    const data = await getDataFromSF(url);
    const newResult = data?.records?.map(async (item) => {
      if (item?.Logo__c != null) {
        const dom = new JSDOM(item?.Logo__c);
        // Access the img element within the div
        var imgElement = dom.window.document.querySelector("img");

        // Get the src attribute of the img element
        var srcValue = imgElement.getAttribute("src");
        // Split the URL by '&' to get individual parameters
        var params = srcValue.split("&");

        // Loop through the parameters to find the one containing 'refid'
        var refid;
        for (var i = 0; i < params.length; i++) {
          if (params[i].includes("refid=")) {
            // Extract the value of 'refid'
            refid = params[i].split("=")[1];
            break;
          }
        }
        const apiurl = `${process.env.SF_API_URL}services/data/v60.0/sobjects/SCHOOL__C/${item?.Id}/richTextImageFields/Logo__c/${refid}`;

        const data = await getDataFromSF(apiurl);
        console.log(data);
        return data;
      }
      return null;
    });
    return res.status(200).json(newResult);
  }
}

module.exports = ScriptController;
