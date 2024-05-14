const School = require("../models/School");
const { getDataFromSF } = require("../service/salesforce.service");
const SchoolService = require("../service/school.service");

class SchoolController {
  constructor() {
    this.schoolService = new SchoolService();
  }

  async addOrUpdateSchool(req, res) {
    // const { id } = req.user;
    const result = await this.schoolService.createOrUpdateSchool(req.body);
    res.status(200).json({ success: true, data: result });
  }

  async getAllSchool(req, res) {
    try {
    const { page, limit,filter, searchType, searchTerm } = req.query;
    return res
      .status(200)
      .json(await this.schoolService.getAllSchool(page, limit,filter, searchType, searchTerm));
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getSchool(req, res) {
    return res
      .status(200)
      .json(await this.schoolService.findById(req.params.schoolId));
  }

  async getSchoolByCountryStateOrSchoolType(req, res) {
    return res
      .status(200)
      .json(
        await this.schoolService.getSchoolByCountryStateOrSchoolType(req.query)
      );
  }

  async getSchoolProgram(req, res) {
    const { schoolId } = req.params;
    const { page, limit } = req.query;
    return res
      .status(200)
      .json(await this.schoolService.getSchoolProgram(schoolId, page, limit));
  }

  async schoolSync(req, res) {
    const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,ExternalId__c,Name,Founded_Year__c,Features__c,Logo__c,LegalName__c,VATNumber__c,UniversityProposalSentDate__c,NextFollowUpDate__c,Tax__c,About__c,ContractedCountries__c,Location__c,Address_Line1__c,Address_Line2__c,Country__c,Pincode__c,Latitude__c,Longitude__c,Total_Students__c,International_Students__c,Time_Ranking__c,QS_Ranking__c,DLI__c,Global_Ranking__c,Entry_Requirements__c,Offer_Conditional_Admission__c,CurrencyIsoCode,Is_Recommended__c,School_Rank__c,Academic_Percentage__c,Duolingo__c,IELTS_Requirement__c,Sequence__c,Interview_Required__c,MOI__c,PTE_Requirement__c,University_English_Test__c,waiver_on_class_12_English__c,Avg_Cost_Of_Tuition_Year__c,Cost_Of_Living_Year__c,Application_Fee__c,Estimated_Total_Year__c,GRE_Percentile__c,GMAT_Quantitative_Score__c+FROM SCHOOL__C ORDER BY Name `;
    console.log(url);
    // const data = await getDataFromSF(url);
    // console.log(data, url);
    return res.status(200).json({ name: "nitin" });
  }

  async getSchoolId(req, res) {
    try {
      const { schoolSfId } = req.params;
      const schoolData = await School.findOne({Id: schoolSfId },{ _id: 1});
      if(!schoolData) {
        res.status(404).json({message: "School not found"});
      }
      res.status(200).json({data: schoolData});
    }catch(error) {
      throw error;
    }
  }
}

module.exports = SchoolController;
