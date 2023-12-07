
function mapStudent(id, agentId, body) {
  const countryOfInterest = body.Preferred_Country__c.split(";");

  return {
    agentId,
    studentInformation: {
      salutation: body.Salutation,
      firstName: body.FirstName,
      lastName: body.LastName,
      source: body.Source__c,
      passportNumber: body.Passport_Number__c,
      mobile: body.MobilePhone,
      whatsappNumber: body.Whatsapp_No__c,
      countryOfInterest,
      email: body.Email,
      staffId: body.Partner_Account_Id__c,
      counsellorId: body.Doc_Verification_Officer_Id__c,
      intakePreferred: body.Intake_Preferred__c,
      dp: body.BDM_User_Id__c
    },
    demographicInformation: {
      medicalHistoryDetails: body.Medical_History_Detail__c,
      haveMedicalHistory: body.Medical_History__c === "YES",
      maritalStatus: body.Martial_Status__c,
      gender: body.Gender__c,
      dateOfBirth: body.Birthdate,
      firstLanguage: body.First_Language__c,
      country: body.Country_of_Citizenship__c,
    },
    emergencyContact: {
      name: body.EmergencyContactName__c,
      relationship: body.Relationship__c,
      email: body.EmergencyContactEmail__c,
      phoneNumber: body.Phone,
      country: body.Country__c,
      address: body.OtherAddress
    },
    backgroundInformation: {
      isRefusedVisa: body.Have_you_been_refused_a_visa__c === "YES",
      haveStudyPermit: body.Do_you_have_a_valid_Study_Permit_Visa__c,
      studyPermitDetails: body.Study_Permit_Visa_Details__c,
    },
    address: {
      address: body.MailingAddress__c,
      city: body.MailingCity,
      state: body.MailingState,
      country: body.MailingCountry,
      zipCode: body.MailingPostalCode
    },
    salesforceId: body.Id,
    externalId: body.ExternalId__c,
    modifiedBy: id,
    createdBy: id
  };
}

function mapSchool(id, body) {
  let data = {
    basicDetails: {},
    address: {},
    financialDescription: {},
    modifiedBy: id
  };

  if (typeof body.Name != "undefined") {
    data.basicDetails.schoolId = body.Name;
  }
  if (typeof body.LegalName__c != "undefined") {
    data.basicDetails.name = body.LegalName__c;
  }
  if (typeof body.Logo__c != "undefined") {
    data.basicDetails.logo = body.Logo__c;
  }
  if (typeof body.Founded_Year__c != "undefined") {
    data.basicDetails.foundedYear = body.Founded_Year__c;
  }
  if (typeof body.School_Type__c != "undefined") {
    data.basicDetails.schoolType = body.School_Type__c;
  }
  if (typeof body.Total_Students__c != "undefined") {
    data.basicDetails.totalStudents = body.Total_Students__c;
  }
  if (typeof body.International_Students__c != "undefined") {
    data.basicDetails.internationStudents = body.International_Students__c;
  }
  if (typeof body.DLI__c != "undefined") {
    data.basicDetails.dli = body.DLI__c;
  }
  if (typeof body.Images__c != "undefined") {
    let arr = body.Images__c.split(";");
    data.basicDetails.images = arr;
  }
  if (typeof body.Location__c != "undefined") {
    data.address.state = body.Location__c;
  }
  if (typeof body.Country__c != "undefined") {
    data.address.country = body.Country__c;
  }
  if (typeof body.Address_Line1__c != "undefined") {
    data.address.addressLine1 = body.Address_Line1__c;
  }
  if (typeof body.Address_Line2__c != "undefined") {
    data.address.addressLine2 = body.Address_Line2__c;
  }
  if (typeof body.City__c != "undefined") {
    data.address.city = body.City__c;
  }
  if (typeof body.Latitude__c != "undefined") {
    data.address.lat = body.Latitude__c;
  }
  if (typeof body.Longitude__c != "undefined") {
    data.address.lng = body.Longitude__c;
  }
  if (typeof body.Pincode__c != "undefined") {
    data.address.pincode = body.Pincode__c;
  }
  if (typeof body.About__c != "undefined") {
    data.about = body.About__c;
  }
  if (typeof body.Features__c != "undefined") {
    let arr = body.Features__c.split(";");
    let arr1 = [];
    for (let i = 0; i < arr.length; i++) {
      arr1.push({ name: arr[i], icon: '', description: '' });
    }
    data.features = arr1;
  }
  if (typeof body.Avg_Cost_Of_Tuition_Year__c != "undefined") {
    data.financialDescription.avgCostOfTuitionPerYear = body.Avg_Cost_Of_Tuition_Year__c;
  }
  if (typeof body.Cost_Of_Living_Year__c != "undefined") {
    data.financialDescription.costOfLivingPerYear = body.Cost_Of_Living_Year__c;
  }
  if (typeof body.Application_Fee__c != "undefined") {
    data.financialDescription.applicationFees = body.Application_Fee__c;
  }
  if (typeof body.Estimated_Total_Year__c != "undefined") {
    data.financialDescription.estimatedTotalPerYear = body.Estimated_Total_Year__c;
  }
  if (typeof body.CurrencyIsoCode != "undefined") {
    data.currency = body.CurrencyIsoCode;
  }
  if (typeof body.Entry_Requirements__c != "undefined") {
    let arr = body.Entry_Requirements__c.split(";");
    data.entryRequirements = arr;
  }
  if (typeof body.Is_Recommended__c != "undefined") {
    data.isRecommended = body.Is_Recommended__c;
  }
  if (typeof body.Sequence__c != "undefined") {
    data.sequence = body.Sequence__c;
  }
  if (typeof body.School_Rank__c != "undefined") {
    data.schoolRank = body.School_Rank__c;
  }
  if (typeof body.Offer_Conditional_Admission__c != "undefined") {
    data.offerConditionalAdmission = body.Offer_Conditional_Admission__c;
  }
  if (typeof body.ExternalId__c != "undefined") {
    data.externalId = body.ExternalId__c;
  }
  return data;
}

function mapProgram(id, schoolId, body) {
  let data = {
    modifiedBy: id,
    externalId: body.ExternalId__c,
    schoolId: schoolId,
    about: {
      details: {},
      cost: {},
      description: {},
      applicationDates: []
    },
    fee: {}
  };

  if (typeof body.Name != "undefined") {
    data.name = body.Name;
  }

  if (typeof body.Length__c != "undefined") {
    data.about.details.length = body.Length__c;
  }

  if (typeof body.Program_level__c != "undefined") {
    data.about.details.programLevel = body.Program_level__c;
  }

  if (typeof body.Tuition__c != "undefined") {
    data.about.cost.tuitionFees = body.Tuition__c;
  }

  if (typeof body.Application_fee__c != "undefined") {
    data.about.cost.applicationFees = body.Application_fee__c;
  }

  if (typeof body.Cost_of_Living__c != "undefined") {
    data.about.cost.costOfLiving = body.Cost_of_Living__c;
  }

  if (typeof body.Country__c != "undefined") {
    data.country = body.Country__c;
  }

  if (typeof body.ExternalId__c != "undefined") {
    data.externalId = body.ExternalId__c;
  }

  if (typeof body.Name != "undefined") {
    data.name = body.Name;
  }

  if (typeof body.Admission_Requirements__c != "undefined") {
    let arr = body.Admission_Requirements__c.split(";");
    data.requirements = arr;
  }

  if (typeof body.Program_Description__c != "undefined") {
    data.about.description = body.Program_Description__c;
  }

  if (typeof body.International_Health_Insurance_Fee__c != "undefined") {
    data.fee.internationalHealthInsurance = body.International_Health_Insurance_Fee__c;
  }

  if (typeof body.Career_Advising_and_Transition_Services__c != "undefined") {
    data.fee.careerAdvisingAndTransitionServices = body.Career_Advising_and_Transition_Services__c;
  }




  // if (typeof body.Status__c != "undefined") {
  //   data.about.applicationDates[0] = { ...data.about.applicationDates[0], status: body.Status__c };
  // }

  if (typeof body.requiredProgramLevel != "undefined") {
    data.about.details.requiredProgramLevel = body.requiredProgramLevel;
  }

  if (typeof body.commission != "undefined") {
    data.about.cost.commission = body.commission;
  }

  if (typeof body.avgCostOfTuitionPerYear != "undefined") {
    data.fee.avgCostOfTuitionPerYear = body.avgCostOfTuitionPerYear;
  }

  if (typeof body.estimatedTotalPerYear != "undefined") {
    data.fee.estimatedTotalPerYear = body.estimatedTotalPerYear;
  }

  if (typeof body.city != "undefined") {
    data.fee.city = body.city;
  }

  if (typeof body.icon != "undefined") {
    data.fee.icon = body.icon;
  }

  if (typeof body.isRecommended != "undefined") {
    data.fee.isRecommended = body.isRecommended;
  }

  if (typeof body.discipline != "undefined") {
    data.fee.discipline = body.discipline;
  }

  if (typeof body.subDiscipline != "undefined") {
    data.fee.subDiscipline = body.subDiscipline;
  }

  if (typeof body.deliveryMethod != "undefined") {
    data.fee.deliveryMethod = body.deliveryMethod;
  }

  if (typeof body.requirementExamType != "undefined") {
    data.fee.requirementExamType = body.requirementExamType;
  }

  if (typeof body.requirementScoreInformation != "undefined") {
    data.fee.requirementScoreInformation = body.requirementScoreInformation;
  }

  return data;
}

function mapIntake(id, programId, schoolId, body) {
  let data = {
    name: body.Name,
    programId,
    schoolId,
    startDate: body.Start_Date__c,
    endDate: body.End_Date__c,
    externalId: body.ExternalId__c,
    updatedBy: id,
    month: body.Months__c,
    year: body.Session__c
  };

  if (typeof body.Name != "undefined") {
    data.name = body.Name;
  }

  return data;
}

function mapEducation(body, studentId, modifiedBy) {
  return {
    degree: body.Name,
    level: body.Level_of_Education__c,
    country: body.Country_of_Institution__c,
    institutionName: body.Name_of_Institution__c,
    affiliatedUniversity: body.Affiliated_University__c,
    class: body.Class__c,
    isDegreeAwarded: body.Degree_Awarded__c === "YES",
    degreeAwardedOn: body.Degree_Awarded_On__c,
    attendedFrom: body.Attended_Institution_From__c,
    attendedTo: body.Attended_Institution_To__c,
    cgpa: body.CGPA__c,
    studentId,
    modifiedBy,
    showInProfile: body.ShowInProfile__c,
    externalId: body.ExternalId__c,
    instituteLanguage: body.Primary_Language_of_Instruction__c,
    isLocked: body.Lock_Record__c,
  };
}

function mapWorkHistory(body, studentId, modifiedBy) {
  return {
    employerName: body.Name,
    designation: body.Designation__c,
    doj: body.Date_of_Joining__c,
    dor: body.Date_of_relieving__c,
    contactInfo: body.Contact_info__c,
    email: body.Email_Id__c,
    studentId,
    modifiedBy,
    externalId: body.ExternalId__c,
  };
}

function mapTestScore(
  body,
  examType,
  studentId,
  modifiedBy
) {
  return {
    examType,
    trfId: body.Name,
    doe: body.Date_of_Exam__c,
    certificateNo: body.ID_Certificate_No__c,
    scoreInformation: [],
    studentId,
    modifiedBy,
    externalId: body.ExternalId__c,
  };
}

function mapDocument(
  body,
  documentTypeId,
  studentId,
  modifiedBy
) {
  return {
    documentTypeId,
    url: body.SharepointPath__c,
    status: body.Status__c,
    userId: studentId,
    modifiedBy,
    externalId: body.ExternalId__c,
  };
}

function mapPayment(body, studentId, modifiedBy) {
  //TODO: schoolId mapping
  //TODO: applicationId mapping
  //TODO: programme mapping
  return {
    paymentName: body.Name,
    studentId,
    schoolId: body.School_Id__c,
    applicationId: body.Application_Id__c,
    programmeId: body.Programme_Id__c,
    amount: body.Amount__c,
    currency: body.CurrencyIsoCode,
    date: body.Payment_Date__c,
    status: body.Status__c,
    modifiedBy,
    externalId: body.ExternalId__c,
  };
}

function mapTask(
  body,
  studentId,
  modifiedBy,
  documentId,
  documentTypeId
) {
  //TODO: applicationId mapping
  return {
    name: body.Name,
    status: body.Status__c,
    description: body.Description__c,
    type: body.Type__c,
    priority: body.Priority__c,
    isRequired: body.Mandatory__c,
    publishToPortal: body.Publish_To_Portal__c,
    isReminderSet: body.IsReminderSet__c,
    isArchived: body.IsArchived__c,
    applicationId: body.Application_Id__c,
    studentId:studentId,
    documentId:documentId,
    documentTypeId:documentTypeId,
    externalId: body.ExternalId__c,
    modifiedBy: modifiedBy,
    agentId:modifiedBy
  };
}

function mapComment(body, userId, relationId) {
  return {
    message: body.Message_Body__c,
    userId,
    relationId,
    externalId: body.ExternalId__c,
  };
}


module.exports = {
    mapComment,
    mapDocument,
    mapEducation,
    mapIntake,
    mapPayment,
    mapProgram,
    mapTask,
    mapSchool,
    mapWorkHistory,
    mapStudent,
    mapTestScore
}