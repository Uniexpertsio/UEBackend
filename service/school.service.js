const uuid = require("uuid");
const School = require("../models/School");
const Currency = require("../models/Currency");
const { sendToSF, sendDataToSF }  = require("../service/salesforce.service");
const { MappingFiles } = require('./../constants/Agent.constants');

class SchoolService {

  async createSchool(id, body) {
    const externalId = uuid.v4();
    body.entryRequirements.push(
      `This program does${body.offerConditionalAdmission ? "" : " not"} offer conditional admission`
    );

    const school = await School.create({ ...body, modifiedBy: id, createdBy: id, externalId });

    // "{
    //   ""attributes"": {
    //     ""type"": ""School__c"",
    //     ""url"": ""/services/data/v56.0/sobjects/School__c/a006D00000AgAT5QAN""
    //   },
    //   ""Id"": ""a006D00000AgAT5QAN"",
    //   ""Name"": ""Sample Request"",
    //   ""Founded_Year__c"": 2014,
    //   ""Features__c"": ""No Co-op /Internship Participation"",
    //   ""LegalName__c"": ""sample Body"",
    //   ""Partner_Account_Id__c"": ""7a0843f3-68e3-482e-9461-a69a9d5421d2"",
    //   ""VATNumber__c"": ""ERWERDSE432"",
    //   ""UniversityProposalSentDate__c"": ""2023-01-22"",
    //   ""NextFollowUpDate__c"": ""2023-01-22"",
    //   ""Tax__c"": 234567,
    //   ""About__c"": ""fvdscxgfdegdd"",
    //   ""ContractedCountries__c"": ""Aland Islands"",
    //   ""Location__c"": ""sedrtfyuio"",
    //   ""Address_Line1__c"": ""375 Beale St"",
    //   ""Address_Line2__c"": ""e Staadawca"",
    //   ""City__c"": ""San Francisco"",
    //   ""Country__c"": ""Aland Islands"",
    //   ""Pincode__c"": 94105,
    //   ""Latitude__c"": ""34"",
    //   ""Longitude__c"": ""324"",
    //   ""Total_Students__c"": 5000,
    //   ""International_Students__c"": 23,
    //   ""Minimum_work_history__c"": 2,
    //   ""Maximum_gap_allowed__c"": 2,
    //   ""Time_Ranking__c"": 233,
    //   ""QS_Ranking__c"": 22,
    //   ""DLI__c"": 23,
    //   ""Global_Ranking__c"": 34,
    //   ""Entry_Requirements__c"": ""vgfvdcserftgyuhjiyutr"",
    //   ""Offer_Conditional_Admission__c"": true,
    //   ""CurrencyIsoCode"": ""GBP"",
    //   ""Is_Recommended__c"": true,
    //   ""School_Rank__c"": 34,
    //   ""Academic_Percentage__c"": ""32"",
    //   ""Duolingo__c"": ""23"",
    //   ""IELTS_Requirement__c"": ""2"",
    //   ""Sequence__c"": 3,
    //   ""Interview_Required__c"": ""MOC+Telephonic Interview"",
    //   ""MOI__c"": ""Accepted within 3 years"",
    //   ""PTE_Requirement__c"": ""23"",
    //   ""University_English_Test__c"": ""HLA – Overall B2+ with B2 in each element"",
    //   ""waiver_on_class_12_English__c"": ""23"",
    //   ""Avg_Cost_Of_Tuition_Year__c"": 560000,
    //   ""Cost_Of_Living_Year__c"": 4000,
    //   ""Application_Fee__c"": 5674,
    //   ""Estimated_Total_Year__c"": 569674,
    //   ""Duolingo_Conversation__c"": 4,
    //   ""Duolingo_Production__c"": 234,
    //   ""Duolingo_Comprehension__c"": 23,
    //   ""Duolingo_Overall__c"": 56,
    //   ""Duolingo_Percentile__c"": 56,
    //   ""Duolingo_Literacy__c"": 56,
    //   ""XII_Percentile__c"": 56,
    //   ""GMAT_Total_Marks_of_English__c"": 32,
    //   ""Xll_Total_Marks_of_English__c"": 56,
    //   ""GRE_Percentile__c"": 56,
    //   ""GMAT_Quantitative_Percentile__c"": 56,
    //   ""GMAT_Verbal_Score__c"": 56,
    //   ""GMAT_Integrated_Listening_Score__c"": 56,
    //   ""GMAT_Integrated_Listening_Percentile__c"": 56,
    //   ""GMAT_Verbal_Percentile__c"": 56,
    //   ""GMAT_Quantitative_Score__c"": 56,
    //   ""GMAT_Total_Percentile__c"": 56,
    //   ""GRE_Verbal_Reasoning_Percentile__c"": 56,
    //   ""GRE_Verbal_Reasoning_Score__c"": 56,
    //   ""GRE_Quantitative_reasoning_Score__c"": 56,
    //   ""GRE_Analytical_reasoning_Percentile__c"": 56,
    //   ""GRE_Analytical_reasoning_Score__c"": 56,
    //   ""TIP_Listening__c"": 56,
    //   ""TIP_Reading__c"": 56,
    //   ""TIP_Writing__c"": 56,
    //   ""TIP_Speaking__c"": 56,
    //   ""Lock_Record__c"": false,
    //   ""Min_Percentage__c"": 23,
    //   ""Min_CGPA__c"": 34,
    //   ""Min_GPA__c"": 23,
    //   ""Min_Grade__c"": ""A+,"",
    //   ""Min_Class__c"": ""Second Class"",
    //   ""Min_Score__c"": 23,
    //   ""Min_Division__c"": ""First""
    // }"			
          
    const url = "School__c/a006D00000AgAT5QAN"
    const sf = await await sendToSF(MappingFiles.SCHOOL_school, {
      ...school,
      _user: { id },
      url
    });
    console.log("sf: ", sf)
    return { id: school._id };
  }

  async createOrUpdateSchool(body) {
    return new Promise(async (resolve, reject) => {
        try {
            let sfId = body?.School_Id__c;

            const checkSchoolExist = await School.findOne({ School_Id__c: sfId });

            if (checkSchoolExist?.School_Id__c) {
                await School.updateOne(
                    { School_Id__c: sfId },
                    { $set: { ...body } },
                    { new: true }
                );
                resolve({ message: "Success", status: 200, sf: sfId });
            } else {
                await School.create({ ...body });
                resolve({ message: "Success", status: 201, sf: sfId });
            }
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}


  async getAllSchool() {
    const schools = await School.find({});
    return this.parseSchoolList(schools);
  }

  async getSchoolByCountryStateOrSchoolType(query) {
    let filter = {};

    if (query.country) {
      filter = {
        ...filter,
        "address.country": { $regex: query.country },
      };
    }

    if (query.states && query.states.length) {
      filter = {
        ...filter,
        "address.state": { $in: query.states },
      };
    }

    if (query.schoolTypes) {
      filter = {
        ...filter,
        "basicDetails.schoolType": { $in: query.schoolTypes },
      };
    }

    const schools = await School.find(filter);
    return this.parseSchoolList(schools);
  }

  async parseSchool(school) {
    school = school["_doc"];
    school.id = school._id;

    const currency = await Currency.findOne({ symbol: school.currency });

    delete school._id;
    delete school.__v;
    return {
      ...school,
      currency,
    };
  }

  async parseSchoolList(schools) {
    return Promise.all(
      schools.map(async (school) => {
        return this.parseSchool(school);
      })
    );
  }

  async findById(id) {
    const school = await School.findOne({ School_Id__c: id});

    if (!school) {
      throw new Error(`No school found for id - ${id}`);
    }

    return await this.parseSchool(school);
  }
}

module.exports = SchoolService;
