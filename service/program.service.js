const { v4: uuid } = require("uuid");
const Program = require("../models/Program");
const School = require("../models/School");
const Intake = require("../models/Intake");
const Student = require("../models/Student");
const Currency = require("../models/Currency");
const TestScore = require("../models/TestScore");
const SchoolService = require("../service/school.service");
// const SalesforceService = require("src/salesforce/salesforce.service");
const { MappingFiles } = require("./../constants/Agent.constants");
const { getDataFromSF } = require("./salesforce.service");
const NodeCache = require("node-cache");
const Eligibility = require("../models/Eligibility");
const { returnField } = require("../utils/emailValidator");
const { ObjectId } = require("mongodb");
const cache = new NodeCache();

class ProgramService {
  constructor() {
    this.programModel = Program;
    this.schoolModel = School;
    this.intakeModel = Intake;
    this.studentModel = Student;
    this.currencyModel = Currency;
    this.testScoreModel = TestScore;
    this.schoolService = new SchoolService();
    //this.salesforceService = SalesforceService;
  }

  async getProgram(id, page, limit, search) {
    let dataQuery;
    let totalRecordsQuery;
    let searchCondition = {};

    const skip = (page - 1) * limit;

    if (ObjectId.isValid(id)) {
      searchCondition.School__c = id;
    } else {
      searchCondition.School__c = id;
    }

    // Add search condition for program name if search is provided
    if (search) {
      const searchTerms = search.split(" ").filter((term) => term.length > 0);
      if (searchTerms.length > 0) {
        searchCondition.$or = searchTerms.map((term) => ({
          Name: { $regex: term, $options: "i" },
        }));
      }
    }

    dataQuery = this.programModel.find(searchCondition);
    totalRecordsQuery = this.programModel.countDocuments(searchCondition);

    // If page and limit are provided, apply limit and skip
    if (page && limit) {
      dataQuery = dataQuery.limit(parseInt(limit)).skip(skip);
    }

    const [data, totalRecords] = await Promise.all([
      dataQuery,
      totalRecordsQuery,
    ]);

    return {
      success: true,
      data: {
        data: data,
        totalRecords: totalRecords,
      },
    };
  }

  async getAllProgram(page, limit, programFilter, searchType, searchTerm) {
    try {
      // const cacheKey =
      //   page && limit && programFilter && searchType && searchTerm
      //     ? `${page}-${limit}-${programFilter}-${searchType}-${searchTerm}`
      //     : "allPrograms";
      // const cachedData = cache.get(cacheKey);
      // console.log("cachedData____", cache.has(cacheKey), cachedData);

      // if (cachedData) {
      //   console.log(`Serving from cache for key: ${cacheKey}`);
      //   return cachedData;
      // }

      const skip = (page - 1) * limit;
      let filter = {};
      let sortQuery = {};
      switch (programFilter) {
        case "Top Programs":
          filter = { Top_Programs__c: { $ne: null } };
          sortQuery = { Top_Programs__c: 1 };
          break;
        case "Recommended":
          filter = { Recommended__c: true };
          sortQuery = { Name: 1 };
          break;
        case "Most Chosen":
          filter = { Most_Chosen__c: true };
          sortQuery = { Name: 1 };
          break;
        case "Fast Offers":
          filter = { Fast_Offer__c: true };
          sortQuery = { Name: 1 };
          break;
        case "All Programs":
          sortQuery = { Name: 1 };
          break;
        default:
          break;
      }

      let countryQuery = {};
      let programLevelQuery = {};
      let schoolIds = [];

      if (searchType === "Country__c") {
        console.log("searchType", searchType);
        countryQuery = { Country__c: new RegExp(searchTerm, "i") };
        const schools = await School.find(countryQuery);
        if (schools.length === 0) {
          return { programs: [], totalPrograms: 0 };
        }
        schoolIds = schools.map((school) => school.Id);
      } else if (searchType === "Program_level__c&&Country__c") {
        console.log("searchType", searchType);
        countryQuery = { Country__c: new RegExp(searchTerm[1], "i") };
        programLevelQuery = {
          Program_level__c: new RegExp(searchTerm[0], "i"),
        };
        const schools = await School.find(countryQuery);
        console.log("schooll", schools);
        if (schools.length === 0) {
          return { programs: [], totalPrograms: 0 };
        }
        schoolIds = schools.map((school) => school.Id);
      }

      const query = {
        ...filter,
        ...(schoolIds.length > 0 ? { School__c: { $in: schoolIds } } : {}),
        ...programLevelQuery,
      };

      // const programs = await this.programModel
      //   .find({ ...query })
      //   .sort(sortQuery)
      //   .limit(limit)
      //   .skip(skip);

      const programs = await this.programModel.aggregate([
        { $match: query },
        ...(sortQuery && Object.keys(sortQuery).length > 0
          ? [{ $sort: sortQuery }]
          : []),
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "schools", // The name of the School collection
            localField: "School__c", // The field in the programs collection
            foreignField: "Id", // The field in the schools collection
            as: "schoolDetails", // The name of the array field to be added
          },
        },
        {
          $unwind: "$schoolDetails", // Deconstructs the array field to output one document for each element
        },
        {
          $addFields: {
            SchoolName: "$schoolDetails.Name", // Add schoolDetails.name as SchoolName
            SchoolId: "$schoolDetails._id",
          },
        },
        {
          $project: {
            schoolDetails: 0, // Optionally remove the original schoolDetails field
          },
        },
      ]);
      const totalPrograms = await this.programModel.countDocuments(query);
      const result = { programs, totalPrograms };

      // Cache the result for future requests
      // const cacheResult = await cache.set(cacheKey, result, 3600); // Cache for 1 hour (3600 seconds)
      // console.log("cacheResult::::", cacheResult);

      return result;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async parseProgram(data) {
    data = data["_doc"];
    data.id = data._id;

    const school = await this.schoolModel.findById(data.schoolId);
    const currency =
      school && (await this.currencyModel.findOne({ symbol: school.currency }));

    delete data._id;
    delete data.__v;
    return {
      ...data,
      currency,
      intakes: await this.getLast5Intakes(data.id),
    };
  }

  getLast5Intakes(programId) {
    return this.intakeModel
      .find({ programId, endDate: { $gte: new Date() } })
      .sort({ endDate: 1 })
      .limit(5);
  }

  async createProgram(id, schoolId, programCreateDto) {
    const externalId = uuid();
    const program = await this.programModel.create({
      ...programCreateDto,
      modifiedBy: id,
      createdBy: id,
      externalId,
      schoolId,
    });
    await this.schoolModel.updateOne(
      { _id: schoolId },
      { $push: { programmes: program._id }, $set: { modifiedBy: id } }
    );

    // {
    //   ""GMAT_Verbal_Percentile__c"": 22,
    //   ""Name"": ""Sample Body for Salesforce"",
    //   ""Discipline__c"": ""Disciplines"",
    //   ""Duolingo_Comprehension__c"": 56,
    //   ""Duolingo_Conversation__c"": 34,
    //   ""GRE_Percentile__c"": 76,
    //   ""Offer_Conditional_Admission__c"": true,
    //   ""TIP_Writing__c"": 46,
    //   ""GRE_Analytical_reasoning_Score__c"": 654,
    //   ""GRE_Verbal_Reasoning_Score__c"": 54,
    //   ""GRE_Verbal_Reasoning_Percentile__c"": 45,
    //   ""City__c"": ""rddsfg"",
    //   ""Icon__c"": ""54fwdfgge"",
    //   ""IsRecommended__c"": true,
    //   ""GMAT_Total_Marks_of_English__c"": 44,
    //   ""Minimum_work_history__c"": 55,
    //   ""QS_Ranking__c"": 76,
    //   ""Maximum_gap_allowed__c"": 65,
    //   ""Global_Ranking__c"": 54,
    //   ""Time_Ranking__c"": 34,
    //   ""required_Program_Level__c"": ""Higher Secondary"",
    //   ""Requirement_Exam_Type__c"": ""45"",
    //   ""Estimated_Total_Per_Year__c"": 654,
    //   ""GMAT_Quantitative_Score__c"": 45,
    //   ""Delivery_Method__c"": ""Online"",
    //   ""GMAT_Verbal_Score__c"": 23,
    //   ""TIP_Speaking__c"": 45,
    //   ""TIP_Reading__c"": 45,
    //   ""TIP_Listening__c"": 67,
    //   ""commission__c"": 65,
    //   ""GMAT_Total_Percentile__c"": 56,
    //   ""GRE_Quantitative_reasoning_Score__c"": 34,
    //   ""Average_Cost_Of_Tuition_Per_Year__c"": 45,
    //   ""GRE_Analytical_reasoning_Percentile__c"": 6,
    //   ""XII_Total_Marks_of_English__c"": 45,
    //   ""GMAT_Integrated_Listening_Percentile__c"": 34,
    //   ""Lock_Record__c"": false,
    //   ""Duolingo_Percentile__c"": 34,
    //   ""Duolingo_Literacy__c"": 65,
    //   ""GMAT_Quantitative_Percentile__c"": 56,
    //   ""GMAT_Integrated_Listening_Score__c"": 78,
    //   ""Duolingo_Overall__c"": 67,
    //   ""School__r"":{
    //       ""ExternalId__c"": ""ertfjf-adrcw37y-fhda3ter6""},
    //   ""XIIth_Percentile__c"": 43,
    //   ""Length__c"": ""4"",
    //   ""Duolingo_Production__c"": 34,
    //   ""Program_level__c"": ""Under Graduate"",
    //   ""Tuition__c"": 44,
    //   ""Application_fee__c"": 55,
    //   ""Starting_Dates__c"": ""2023-01-22"",
    //   ""Cost_of_Living__c"": 65,
    //   ""Status__c"": ""Open Now"",
    //   ""Submission_deadlines__c"": ""2023-01-23"",
    //   ""Note__c"": ""hgfds"",
    //   ""Scholarship__c"": ""erszdsfgkjuy"",
    //   ""Department__c"": ""Arts and media"",
    //   ""Link__c"": ""etyu"",
    //   ""International_Health_Insurance_Fee__c"": 34,
    //   ""Career_Advising_and_Transition_Services__c"": 456,
    //   ""Sub_Discipline__c"": ""trrtuyy""
    // }
    // EndPointUrl For Patch:-- https://uniexperts--dev.sandbox.my.salesforce.com/services/data/v55.0/sobjects/Programme__c/ExternalId__c/e4433a12-51b8-1adc-c4f5-0f1f0842a973
    //  Headers:
    //         Content-Type:-application/json
    //         Authorization:- Bearer 00DN0000000cDM4!ASAAQDM.EQzHY3pG6TVBBtQU2NDLIkRgO8nWWFlbNUySnCABnD4Wud.Fw7KxzK0A2OXxnp1BXBKosLb.9ZlgfNU01aEVE_ks"
    const url =
      "Programme__c/ExternalId__c/e4433a12-51b8-1adc-c4f5-0f1f0842a973";
    // const sf = await this.salesforceService.sendToSF(MappingFiles.SCHOOL_programme, {
    //   ...program,
    //   schoolId: (await this.schoolService.findById(program.schoolId)).externalId,
    //   _user: { id }, url
    // });
    return { id: program._id };
  }

  async createOrUpdateProgram(programCreateDto) {
    let programSfId = programCreateDto.Id;
    return new Promise(async (resolve, reject) => {
      try {
        const checkProgramExist = await this.programModel.findOne({
          Id: programSfId,
        });
        if (checkProgramExist?.Id) {
          await this.programModel.updateOne(
            { Id: programSfId },
            { $set: { ...programCreateDto } },
            { new: true }
          );
          return resolve({ message: "Success", status: 200, sf: programSfId });
        } else {
          await this.programModel.create({
            ...programCreateDto,
          });
          resolve({ message: "Success", status: 201, sf: programSfId });
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  getSortingMap() {
    return {
      SchoolRank: { schoolRank: 1 },
      Commission: { "about.cost.commission": 1 },
      TuitionFeeHigh: { "about.cost.tuitionFees": -1 },
      TuitionFeeLow: { "about.cost.tuitionFees": 1 },
      ApplicationFeeHigh: { "about.cost.applicationFees": -1 },
      ApplicationFeeLow: { "about.cost.applicationFees": 1 },
    };
  }

  async searchProgram(programFilterDto) {
    let schoolFilter = {};
    let programFilter = {};
    console.log("search  program", programFilterDto);

    if (programFilterDto?.eligibilityFilter) {
      if (programFilterDto.eligibilityFilter?.studentId) {
        // it's just being used to fill the other fields in filter and looks of no use here
      }
      if (programFilterDto.eligibilityFilter?.hasValidVisa) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter?.nationality) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter?.educationCountry) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter.gradingScheme) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter.examType) {
        //both program and school does not have this field so not considering here
      }
      if (
        programFilterDto.eligibilityFilter?.marks &&
        programFilterDto?.eligibilityFilter?.marks.length > 0
      ) {
        //both program and school does not have this field so not considering here
      }
      if (programFilterDto.eligibilityFilter?.shouldShowOnlyDirect) {
        //both program and school does not have this field so not considering here
      }
    }

    if (programFilterDto.schoolFilter) {
      if (programFilterDto.schoolFilter.preferredCountry) {
        schoolFilter = {
          ...schoolFilter,
          "address.country": {
            $regex: programFilterDto.schoolFilter.preferredCountry,
            $options: "i",
          },
        };
      }
      if (
        programFilterDto.schoolFilter.state &&
        programFilterDto?.schoolFilter?.state.length > 0
      ) {
        schoolFilter = {
          ...schoolFilter,
          "address.state": { $in: programFilterDto.schoolFilter.state },
        };
      }
      if (
        programFilterDto.schoolFilter?.schoolIds &&
        programFilterDto.schoolFilter?.schoolIds.length > 0
      ) {
        schoolFilter = {
          ...schoolFilter,
          _id: { $in: programFilterDto.schoolFilter.schoolIds },
        };
      }
      if (
        programFilterDto.schoolFilter.schoolType &&
        programFilterDto.schoolFilter?.schoolType.length > 0
      ) {
        schoolFilter = {
          ...schoolFilter,
          "about.details.schoolType": {
            $in: programFilterDto.schoolFilter?.schoolType,
          },
        };
      }
    }

    if (programFilterDto.programFilters) {
      if (
        programFilterDto.programFilters.programLevels &&
        programFilterDto.programFilters?.programLevels?.length > 0
      ) {
        programFilter = {
          ...programFilter,
          "about.details.programLevel": {
            $in: programFilterDto.programFilters?.programLevels,
          },
        };
      }
      if (programFilterDto.programFilters.intakeId) {
        const intake = await this.intakeModel.findById(
          programFilterDto.programFilters?.intakeId
        );
        const program = intake?.programId;
        programFilter = {
          ...programFilter,
          _id: program,
        };
      }
      if (
        programFilterDto.programFilters.discipline &&
        programFilterDto.programFilters?.discipline.length > 0
      ) {
        programFilter = {
          ...programFilter,
          discipline: {
            $in: programFilterDto.programFilters?.discipline,
          },
        };
      }
      if (
        programFilterDto.programFilters?.subDiscipline &&
        programFilterDto.programFilters?.subDiscipline.length > 0
      ) {
        programFilter = {
          ...programFilter,
          subDiscipline: {
            $in: programFilterDto.programFilters?.subDiscipline,
          },
        };
      }
      if (programFilterDto.programFilters?.showCommission) {
        // not sure what to do with this
      }
      if (programFilterDto.programFilters?.tuitionFee) {
        programFilter = {
          ...programFilter,
          "about.cost.tuitionFees": {
            $lte: programFilterDto.programFilters.tuitionFee,
          },
        };
      }
      if (programFilterDto.programFilters.applicationFee) {
        programFilter = {
          ...programFilter,
          "about.cost.applicationFees": {
            $lte: programFilterDto.programFilters?.applicationFee,
          },
        };
      }
      if (programFilterDto.programFilters?.includeLivingCost) {
        // bigger change
      }
    }

    if (
      Object.keys(schoolFilter).length &&
      Object.keys(programFilter)?.length
    ) {
      programFilter = {
        ...programFilter,
        isRecommended: true,
      };
    }

    let sort = {};
    if (programFilterDto.sortBy) {
      sort = this.getSortingMap()[programFilterDto.sortBy] || {};
    }

    try {
      const schools = await this.schoolModel
        .find(schoolFilter)
        .sort(sort)
        .limit(programFilterDto.limit)
        .skip(programFilterDto.skip);
      const totalRecords = await this.schoolModel.countDocuments(schoolFilter);
      const programs = await this.programModel.find(programFilter);
      const programsIds = programs.map((p) => p.School__c);
      // const programsIds = schools.map((p) => p.Id);
      return this.createProgramSchoolResponse(
        schools,
        programsIds,
        sort,
        totalRecords
      );
    } catch (ex) {
      throw new Error(
        "please verify the filters, hint: check if you're providing a valid id for school and programs"
      );
    }
  }

  async findById(id) {
    const program = await this.programModel.findOne({ Id: id });
    if (!program) {
      throw new Error(`No program found for id - ${id}`);
    }

    return program;
  }

  async getProgramByCountryAndDiscipline(countryDisciplineFilter) {
    let filter = {};

    if (countryDisciplineFilter.country) {
      filter = {
        ...filter,
        country: { $regex: countryDisciplineFilter.country },
      };
    }

    if (countryDisciplineFilter.discipline) {
      filter = {
        ...filter,
        "about.details.programLevel": {
          $in: countryDisciplineFilter.discipline,
        },
      };
    }

    let sort = {};
    if (countryDisciplineFilter.sortBy) {
      sort = this.getSortingMap()[countryDisciplineFilter.sortBy] || {};
    }

    const programs = await this.programModel.find(filter);

    const programsIds = programs.map((p) => p.id);
    const schools = await this.schoolModel.find({}).sort(sort);

    return this.createProgramSchoolResponse(schools, programsIds, sort);
  }

  async createProgramSchoolResponse(
    schools,
    programsIds,
    sort = {},
    totalRecords
  ) {
    const parsedSchools = await this.schoolService.parseSchoolList(schools);

    const response = await Promise.all(
      parsedSchools.map(async (school) => {
        const programIdsAvailable = programsIds.filter(
          (pid) => school.Id === pid
        );
        const programs = await this.programModel
          .find({ School__c: { $in: programIdsAvailable } })
          .sort(sort);
        return {
          school,
          programs: await Promise.all(
            programs.map(async (program) => await this.parseProgram(program))
          ),
        };
      })
    );
    return {
      res: response.filter((res) => res.programs?.length),
      ...(totalRecords && totalRecords),
    };
  }

  getRecentPrograms() {
    return this.programModel.find({}).sort({ createdAt: 1 });
  }

  async getPrograms(schoolId, page, limit, search) {
    const school = await this.schoolModel.findById(schoolId);
    if (!school) {
      throw new Error("School width id: " + schoolId + " not found");
    }

    // return Promise.all(school.programmes.map(async (id) => await this.getProgram(id)));\
    return await this.getProgram(school.Id, page, limit, search);
  }

  async getSimilarProgram(programId) {
    const program = await this.programModel.findById(programId);
    if (!program) throw new Error();
    const { Discipline__c, Sub_Discipline__c } = program;
    // Check if discipline or subDiscipline is null
    if (Discipline__c == null || Sub_Discipline__c == null) {
      // Handle the case where discipline or subDiscipline is null
      // For example, return an empty array or throw an error
      return []; // or throw new Error('Discipline or subDiscipline is null');
    }

    console.log(program);
    const filter = {
      Discipline__c: program.Discipline__c,
      Sub_Discipline__c: program.Sub_Discipline__c,
    };

    const programs = await this.programModel.find(filter);
    return programs;
  }

  // async isEligibleForProgram(programId, studentId) {
  //   try {
  //     const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,Name,Citizenship_Country__c,Duo_12th_Gre_Percentile__c,Duo_Comprehension__c,Duo_Conversation__c,Duo_Literacy__c,Duo_Overall__c,Duo_Production__c,Education_Country__c,Exam_Type__c,GMAT_Exam_Date__c,GRE_Exam_Date__c,Gmat_Integrated_Listening_Percentile__c,Gmat_Integrated_Listening_Score__c,Gmat_Quantitative_Percent__c,Gmat_Quantitative_Score__c,Gmat_Total_Percentile__c,Gmat_Verbal_Percentile__c,Gmat_Verbal_Score__c,Gre_Analytical_reasoning_Percentile__c,Gre_Analytical_reasoning_Score__c,Gre_Quantitative_reasoning_Score__c,Gre_Verbal_Reasoning_Percentile__c,Gre_Verbal_Reasoning_Score__c,Have_GMAT_Exam_Score__c,Have_GRE_Exam_Score__c,Programme__c,Pte_Gmat_12th_Total_Marks_of_English__c,Pte_Listening__c,Pte_Reading__c,Pte_Speaking__c,Pte_Writing__c,School__c,Total_Rank__c,Verbal_Percent__c,Writing_Percent__c,Writing_Score__c+FROM+Eligibility__c+WHERE+Programme__c+=+'${programId}'`;
  //     const data = await getDataFromSF(url);
  //     // console.log(data.records, "SfDATAAAAAAAAAAAA");
  //     if (!data.records.length) {
  //       return { message: "Please try again later" };
  //     }
  //     const sfData = data.records.map((program) => ({
  //       examType: program.Exam_Type__c,
  //       totalScore: program.Duo_Overall__c,
  //     }));
  //     console.log(sfData, "XXXXXXXXXXXXXXXXXX");
  //     const studentData = await Student.findOne(
  //       { salesforceId: studentId },
  //       { _id: 1 }
  //     );
  //     const testScores = await this.testScoreModel.find({
  //       studentId: studentData._id,
  //     });
  //     console.log(testScores, "===============");
  //     const validExamTypes = ["PTE", "TOEFL", "IELTS"];
  //     let isEligible = true;

  //     for (const sfDataEntry of sfData) {
  //       const { examType, totalScore: requiredTotalScore } = sfDataEntry;
  //       console.log(sfDataEntry, "======>");
  //       const testScore = testScores.find((score) => {
  //         if (validExamTypes.includes(examType)) {
  //           return score.selectedType === examType;
  //         } else {
  //           return score.examType === examType;
  //         }
  //       });
  //       console.log(testScore, "====?");
  //       if (!testScore || testScore.totalMarks < requiredTotalScore) {
  //         isEligible = false;
  //         break;
  //       }
  //     }

  //     return isEligible;
  //   } catch (error) {
  //     return false;
  //   }
  // }

  async isEligibleForProgram(programId, studentId) {
    try {
      const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,Name,Citizenship_Country__c,Duo_12th_Gre_Percentile__c,Duo_Comprehension__c,Duo_Conversation__c,Duo_Literacy__c,Duo_Overall__c,Duo_Production__c,Education_Country__c,Exam_Type__c,GMAT_Exam_Date__c,GRE_Exam_Date__c,Gmat_Integrated_Listening_Percentile__c,Gmat_Integrated_Listening_Score__c,Gmat_Quantitative_Percent__c,Gmat_Quantitative_Score__c,Gmat_Total_Percentile__c,Gmat_Verbal_Percentile__c,Gmat_Verbal_Score__c,Gre_Analytical_reasoning_Percentile__c,Gre_Analytical_reasoning_Score__c,Gre_Quantitative_reasoning_Score__c,Gre_Verbal_Reasoning_Percentile__c,Gre_Verbal_Reasoning_Score__c,Have_GMAT_Exam_Score__c,Have_GRE_Exam_Score__c,Programme__c,Pte_Gmat_12th_Total_Marks_of_English__c,Pte_Listening__c,Pte_Reading__c,Pte_Speaking__c,Pte_Writing__c,School__c,Total_Rank__c,Verbal_Percent__c,Writing_Percent__c,Writing_Score__c+FROM+Eligibility__c+WHERE+Programme__c+=+'${programId}'`;
      const data = await getDataFromSF(url);
      if (!data.records.length) {
        return { message: "Please try again later" };
      }

      const sfData = data.records.map((program) => ({
        examType: program.Exam_Type__c,
        totalScore:
          program.Duo_Overall__c || program.Duo_12th_Gre_Percentile__c,
      }));

      const studentData = await Student.findOne(
        { salesforceId: studentId },
        { _id: 1 }
      );

      const testScores = await this.testScoreModel.find({
        studentId: studentData._id,
      });

      const validExamTypes = ["PTE", "TOEFL", "IELTS"];
      let isEligible = false;

      for (const sfDataEntry of sfData) {
        const { examType, totalScore: requiredTotalScore } = sfDataEntry;
        const testScore = testScores.find((score) => {
          if (validExamTypes.includes(examType)) {
            return score.selectedType === examType;
          } else {
            return score.examType === examType;
          }
        });

        if (testScore && testScore.totalMarks >= requiredTotalScore) {
          isEligible = true;
          break;
        }
      }

      return isEligible;
    } catch (error) {
      return false;
    }
  }

  // async programFilter(filter) {
  //   try {
  //     const { examType, totalMark } = filter;
  //     console.log("examType, totalMark", examType, typeof totalMark);

  //     // Create an array to store the eligibilityData
  //     const eligibilityData = [];
  //     if (Array.isArray(examType) && Array.isArray(totalMark)) {
  //       for (let i = 0; i < examType.length; i++) {
  //         const data = await Eligibility.find({
  //           Exam_Type__c: examType[i],
  //           Duo_Overall__c: totalMark[i],
  //         });
  //         eligibilityData.push(...data);
  //       }
  //     } else {
  //       const totalMarkNumber = parseFloat(totalMark);
  //       console.log("totalMarkString", totalMarkNumber);
  //       const data = await Eligibility.aggregate([
  //         {
  //           $match: {
  //             $and: [
  //               { Duo_Overall__c: { $gte: totalMarkNumber } },
  //               { Exam_Type__c: examType },
  //             ],
  //           },
  //         },
  //       ]);
  //       console.log("data???", data);
  //       eligibilityData.push(...data);
  //     }

  //     const programIds = eligibilityData.map((data) => data.programId);
  //     const programData = await this.programModel.find({
  //       _id: { $in: programIds },
  //     });
  //     console.log("programData...", programData);
  //     return programData;
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // }

  // async programFilter(filter) {
  //   try {
  //     const { examType, totalMark } = filter;
  //     const eligibilityData = [];

  //     const isExamTypeArray = Array.isArray(examType);
  //     const isTotalMarkArray = Array.isArray(totalMark);

  //     // const examTypes = isExamTypeArray ? examType : [examType];
  //     // const totalMarks = isTotalMarkArray ? totalMark : [totalMark];
  //     const examTypes = ["IELTS", "PTE"];
  //     const totalMarks = [7, 8];

  //     for (let i = 0; i < examTypes.length; i++) {
  //       // for (let j = 0; j < totalMarks.length; j++) {
  //       // const totalMarkString = totalMarks[j].toString();
  //       console.log(examTypes[i], "=====", totalMarks[i]);
  //       const data = await Eligibility.find({
  //         Exam_Type__c: examTypes[i],
  //         Duo_Overall__c: { $gte: totalMarks[i] },
  //       });
  //       console.log(data);
  //       eligibilityData.push(...data);
  //       // }
  //     }

  //     const programIds = eligibilityData.map((data) => data.programId);
  //     const programData = await this.programModel.find({
  //       _id: { $in: programIds },
  //     });
  //     return programData;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // returnField(examType) {
  //   if (examType === "12th Standard English Mark") {
  //     return "Pte_Gmat_12th_Total_Marks_of_English__c";
  //   } else if (examType === "GRE") {
  //     return "Gre_Analytical_reasoning_Percentile__c";
  //   } else if (examType === "GMAT") {
  //     return "Gmat_Total_Percentile__c";
  //   } else {
  //     return "Duo_Overall__c";
  //   }
  // }
  async programFilter(req, res) {
    try {
      const filterData = req.body;
      const { limit, page } = req.query;
      const skip = (page - 1) * limit;

      const programIdsFromIntake = [];
      let filter = {};
      let sortQuery = {};
      let eligibilityPrograms = [];
      let programIdsFromProgram = [];
      let programIds = [];

      if (filterData.eligibility) {
        const { examType, totalMark } = filterData.eligibility;

        const isExamTypeArray = Array.isArray(examType);
        const isTotalMarkArray = Array.isArray(totalMark);

        const examTypes = isExamTypeArray ? examType : [examType];
        const totalMarks = isTotalMarkArray ? totalMark : [totalMark];

        // Construct the $or query array for bulk query
        const orQuery = examTypes.map((examType, index) => ({
          Exam_Type__c: examType,
          [returnField(examType)]: { $gte: totalMarks[index] },
        }));

        // Execute the bulk query for eligibility data
        const data = await Eligibility.find(
          { $or: orQuery },
          { Programme__c: 1, _id: 0 }
        );
        if (data.length === 0) {
          return { programs: [], totalPrograms: 0 }; // No eligible data found
        }

        eligibilityPrograms = data.map((item) => item.Programme__c);
      }
      if (filterData.school) {
        const {
          preferredCountry,
          schoolType,
          schoolName,
          moi,
          interviewRequired,
          waiverOnClass12English,
        } = filterData.school;

        const query = {
          ...(preferredCountry && { Country__c: preferredCountry }),
          ...(schoolType && { School_Type__c: schoolType }),
          ...(schoolName && { Name: schoolName }),
          ...(moi && { MOI__c: moi }),
          ...(interviewRequired && {
            Interview_Required__c: interviewRequired,
          }),
          ...(waiverOnClass12English && {
            waiver_on_class_12_English__c: waiverOnClass12English,
          }),
        };

        // Execute the bulk query for School data
        const data = await School.find(query, { Id: 1, _id: 0 });
        if (data.length === 0) {
          return { programs: [], totalPrograms: 0 }; // No eligible data found
        }

        const schoolPrograms = data.map((item) => item.Id);
        const programIds = await Program.find(
          {
            School__c: { $in: schoolPrograms },
          },
          { Id: 1, _id: 0 }
        );
        programIdsFromProgram = programIds.map((item) => item.Id);
      }
      if (filterData.program) {
        const { programLevel, intake, discipline, subDiscipline } =
          filterData.program;
        if (intake) {
          const intakeProgramIds = await Intake.find(
            { Name: intake },
            { Programme__c: 1, _id: 0 }
          );
          const intakePrograms = intakeProgramIds.map(
            (item) => item.Programme__c
          );
          programIdsFromIntake.push(...intakePrograms);
        }

        const query = {
          ...(programLevel && { Program_level__c: { $in: programLevel } }),
          ...(intake && { Id: { $in: programIdsFromIntake } }),
          ...(discipline && { Discipline__c: discipline }),
          ...(subDiscipline && { Sub_Discipline__c: { $in: subDiscipline } }),
        };

        // Execute the bulk query for Program data
        const data = await Program.find(query, { Id: 1, _id: 0 });
        if (data.length === 0) {
          return { programs: [], totalPrograms: 0 }; // No eligible data found
        }

        programIds = data.map((item) => item.Id);
      }
      if (filterData.filterBy) {
        switch (filterData.filterBy) {
          case "Top Programs":
            filter = { Top_Programs__c: { $ne: null } };
            sortQuery = { Top_Programs__c: 1 };
            break;
          case "Recommended":
            filter = { Recommended__c: true };
            sortQuery = { Name: 1 };
            break;
          case "Most Chosen":
            filter = { Most_Chosen__c: true };
            sortQuery = { Name: 1 };
            break;
          case "Fast Offers":
            filter = { Fast_Offer__c: true };
            sortQuery = { Name: 1 };
            break;
          case "All Programs":
            sortQuery = { Name: 1 };
            break;
          default:
            break;
        }
      }

      const arrays = [eligibilityPrograms, programIdsFromProgram, programIds];
      // Filter out empty arrays
      const nonEmptyArrays = arrays.filter((array) => array.length > 0);

      // Find common elements
      const commonElements = nonEmptyArrays.reduce(
        (acc, curr) => acc.filter((element) => curr.includes(element)),
        nonEmptyArrays[0]
      );

      console.log(commonElements);
      const commonQuery = {
        ...(commonElements && { Id: { $in: commonElements } }),
        ...filter,
      };
      // Execute the bulk query for program data
      const programs = await Program.find(commonQuery)
        .sort({
          ...sortQuery,
        })
        .skip(skip)
        .limit(limit);

      const totalPrograms = await Program.countDocuments(commonQuery);
      return { programs: programs, totalPrograms: totalPrograms };
    } catch (error) {
      console.error("Error in programFilter:", error);
      throw error;
    }
  }

  async createEligibility(eligibilityCreateDto) {
    try {
      console.log("eligibilityCreateDto", eligibilityCreateDto);
      const eligibility = await Eligibility.create(eligibilityCreateDto);
      console.log("eligibility", eligibility);
      return eligibility;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProgramService;
