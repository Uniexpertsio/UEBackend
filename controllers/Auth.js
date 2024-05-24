const config = require("../config/config");
const jwt = require("jsonwebtoken");
const uuid = require("uuid/v4");
const Common = require("./Common");
const Document = require("../models/Document");

const Config = require("../models/Config");
const Agent = require("../models/Agent");
const { sendEmailWithOTP } = require("../utils/sendMail");
const Staff = require("../models/Staff");
const {
  sendDataToSF,
  updateDataToSF,
  getTnc,
  getPartnerId,
} = require("../service/salesforce.service");
const emailValidator = require("../utils/emailValidator");
const { forgotPasswordRateLimit } = require("../utils/forgotPasswordHelper");

const Auth = { get: {}, post: {}, put: {}, patch: {}, delete: {} };

function convertToBankData(inputData, id) {
  const outputData = {
    Name: inputData?.bank?.bankName,
    ...(id ? { Account__c: id } : {}),
    AccountHolderName__c: inputData?.bank?.name,
    SwiftCode__c: inputData.bank.swiftCode,
    AccountNumber__c: inputData.bank.accountNumber,
    BankCode__c: inputData?.bank?.extraField?.data, // Assuming a default value
    AccountNumberConfirm__c: inputData.bank.accountNumber,
    Status__c: "New", // Assuming a default value
  };

  return outputData;
}

function convertToCompanyData(inputData) {
  const outputData = {
    RecordTypeId: "0125g0000003I7FAAU",
    Company_Logo__c: "",
    Country_Code__c: "+91",
    Timezone_UTC__c: inputData.personalDetails.timezone.utc_offset,
    Same_As_Billing_Address__c: false,
    Timezone_Region__c: inputData.personalDetails.timezone.name,
    Name: inputData.company.companyName,
    Lock_Record__c: true,
    BDM_User__c: "",
    Students_Per_Year__c: inputData.company.studentPerYear.replace("+", ""),
    CurrencyIsoCode: "GBP",
    Year_Founded__c: inputData.company.yearFounded,
    Website: inputData.company.website,
    MaxActiveUsersAllowed__c: 5,
    Country__c: inputData.company.country,
    Phone: inputData.personalDetails.phone,
    EntityType__c: inputData.company.entityType,
    Tax_Number__c: inputData.company.taxNumber,
    Entity_Registration_Number__c: inputData.company?.entityRegistrationNumber,
    Onboarding_Status__c: "New",
    PartnerNotified__c: false,
    Bypass_Documentation__c: false,
    FinalDocumentStatus__c: "Pending",
    Agreement_signed_time_stamp__c: new Date(),
    Terms_Conditions_Agreed__c: "",
    Latitude__c: "",
    Longitude__c: "",
    IP_Address__c: "",
    Acknowledgement_Acceptance__c: false,
    BillingCity: inputData.address.city,
    BillingCountry: inputData.address.country,
    BillingState: inputData.address.state,
    BillingStreet: inputData.address.address,
    BillingPostalCode: inputData.address.zipCode,
    ShippingCity: inputData.address.city,
    ShippingCountry: inputData.address.country,
    ShippingState: inputData.address.state,
    ShippingStreet: inputData.address.address,
    ShippingPostalCode: inputData.address.zipCode,
    Type: "Partner",
    NumberOfEmployees: parseInt(inputData.company.employeeCount),
    Description: "",
  };

  return outputData;
}

function convertToAgentData(inputData, id) {
  const outputData = {
    RecordTypeId: "0125g00000020HQAAY",
    FirstName: inputData.personalDetails.firstName,
    LastName: inputData.personalDetails.lastName,
    MobilePhone: inputData.personalDetails.phone,
    Whatsapp_No__c: inputData.personalDetails.phone,
    Title: inputData?.personalDetails?.jobTitle,
    Email: inputData.personalDetails.email,
    Password__c: inputData?.password,
    AccountId: id, // Assuming a default value
    Active__c: true,
    MailingCity: inputData.address.city,
    MailingState: inputData.address.state,
    MailingCountry: inputData.address.country,
    MailingStreet: inputData.address.address,
    MailingPostalCode: inputData.address.zipCode,
    Country_Code__c: inputData.personalDetails.countryCode,
  };
  return outputData;
}

Auth.get.background = async (req, res, next) => {
  try {
    const config = await Config.findOne({ type: "AUTH_BACKGROUND_IMG" });
    return res.status(200).json({ statusCode: 200, data: config });
  } catch (err) {
    next(err);
  }
};

Auth.get.config = async (req, res, next) => {
  try {
    let bankFields = await Config.findOne({ type: "AUTH_BACKGROUND_IMG" });
    if (!bankFields?.value[req.query.country]) {
      bankFields = { key: "bank_code", value: "Bank Code" };
    } else {
      bankFields = bankFields.value[req.query.country];
    }
    return res.status(200).json({ data: bankFields, statusCode: 200 });
  } catch (err) {
    next(err);
  }
};

// Function to handle user login
Auth.post.login = async (req, res) => {
  try {
    // Extract email and password from request body
    const email = req.body.email;
    const password = req.body.password;

    // Find staff based on email
    let staff = await Staff.findOne({ email: email });

    // Find agent associated with staff
    let agent = await Agent.findById(staff?.agentId);

    // Get current date
    const currentDate = new Date();

    if (!staff) {
      // Return error if user does not exist
      const error = new Error("User does not exist");
      error.statusCode = 404;
      error.error = "User does not exist";
      throw error;
    } else if (!staff.isActive) {
      // Return error if user account is blocked
      const error = new Error("Your account is blocked. Please contact admin.");
      error.statusCode = 400;
      error.error = "Your account is blocked. Please contact admin.";
      throw error;
    } else {
      // Check if last login date is older than 15 days
      const lastLoginDate = new Date(staff.lastLoginDate);
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      if (lastLoginDate < fifteenDaysAgo && staff?.role !== "admin") {
        // Block account if inactive for more than 15 days
        await Staff.updateOne(
          { _id: staff._id },
          { $set: { isActive: false } }
        );
        const error = new Error(
          "Your account is blocked due to inactivity. Please contact admin."
        );
        error.statusCode = 400;
        error.error =
          "Your account is blocked due to inactivity. Please contact admin.";
        throw error;
      }

      // Update last login date
      await Staff.updateOne(
        { _id: staff._id },
        { $set: { lastLoginDate: currentDate } }
      );

      // Compare password
      let matched = Common.comparePassword(staff.password, password);
      if (matched) {
        // Generate JWT token for authentication
        const token = jwt.sign(
          { id: staff._id, email: email },
          config.keys.secret,
          { expiresIn: "24d" }
        );

        // Check if documents are uploaded for the agent
        const docs = await Document.find({ userId: agent._id });
        let docUploaded = docs.length > 0;

        // Return success response with token and document upload status
        return res.status(200).json({
          data: {
            docUploaded,
            ...generateAuthResponse(staff, agent, token, ""),
          },
          statusCode: 200,
          tokens: token,
        });
      } else {
        // Return error if password does not match
        res.status(401).json({
          statusCode: 401,
          message: "You have entered an invalid email or password",
          error: "Unauthorized",
        });
      }
    }
  } catch (err) {
    // Return error response
    console.log("Request: ", err);
    return res.status(400).json({
      statusCode: 400,
      message: err.message,
      error: "Bad Request",
    });
  }
};

// Function used for signup
Auth.post.signup = async (req, res, next) => {
  try {
    const externalId = uuid();
    let idsCollection;
    const agentData = req.body;
    const email = req.body.personalDetails.email;
    const emailValidation = await emailValidator(email);
    if (emailValidation == false) {
      return res.status(400).json({ message: "Email format is wrong" });
    }
    console.log("emailValidation", emailValidation);
    let agent = await Agent.findOne({ "personalDetails.email": email });
    if (agent) {
      return res.status(400).json({ message: "Email already exists" });
    }
    agent = await Agent.findOne({
      "personalDetails.phone": req.body.personalDetails.phone,
    });
    if (agent) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    agent = await Agent.create({ ...agentData, commonId: externalId });

    /// Staff Creation
    const externalStaffId = uuid();
    const staff = await Staff.create({
      fullName:
        agentData.personalDetails.firstName +
        " " +
        agentData.personalDetails.lastName,
      email: agentData.personalDetails.email,
      phone:
        agentData.personalDetails.countryCode + agentData.personalDetails.phone,
      password: agentData.password,
      role: "admin",
      modules: [
        "program_schools",
        "students",
        "applications",
        "financial",
        "generate_report",
        "interview",
      ],
      externalId: externalStaffId,
      agentId: agent._id,
      password: await Common.hashPassword(agentData.password), ////Password Encryption
      notifications: {
        student: true,
        comments: true,
        commissions: true,
        agent: true,
        case: true,
        invoice: true,
        application: true,
        payments: true,
        schools: true,
        intake: true,
        document: true,
      },
    });

    const token = jwt.sign(
      {
        id: staff._id,
        email: email,
      },
      config.keys.secret,
      {
        expiresIn: "24d",
      }
    );

    const companyData = convertToCompanyData(req.body);
    const companyUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Account`;
    const sfCompanyData = await sendDataToSF(companyData, companyUrl);
    if (sfCompanyData && sfCompanyData.success) {
      const agentsData = convertToAgentData(req.body, sfCompanyData.id);
      const agentUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Contact`;
      const sfAgentData = await sendDataToSF(agentsData, agentUrl);
      await Staff.updateOne(
        { _id: staff._id },
        { $set: { sfId: sfAgentData?.id } }
      );
      const bankUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/BankDetail__c`;
      const bankData = convertToBankData(req.body, sfCompanyData.id);
      const sfBankData = await sendDataToSF(bankData, bankUrl);
      const data = await getPartnerId(sfCompanyData?.id);

      idsCollection = {
        bankId: sfBankData?.id,
        contactId: sfAgentData?.id,
        companyId: sfCompanyData?.id,
        agentId: agent?._id,
        partnerId: data?.Partner_Id__c,
      };
      const updatedAgent = await Agent.findByIdAndUpdate(
        agent.id,
        { commonId: sfCompanyData.id, contactId: sfAgentData?.id },
        { new: true }
      );
    }

    return res.status(200).json({
      data: {
        idsCollection,
        ...generateAuthResponse(staff, agent, token, idsCollection?.contactId),
      },
      statusCode: 201,
    });
  } catch (err) {
    return res.status(400).json({
      statusCode: 400,
      message: err.message,
      error: "Bad Request",
    });
  }
};

Auth.patch.signup = async (req, res, next) => {
  try {
    // const externalId = uuid();
    const { requestData, idsCollection } = req.body;
    const { agentId } = req?.params;
    const agent = await Agent.findOneAndUpdate({ _id: agentId }, requestData);
    const staff = await Staff.findOneAndUpdate(
      { agentId: agentId },
      {
        fullName:
          requestData.personalDetails.firstName +
          " " +
          requestData.personalDetails.lastName,
        email: requestData.personalDetails.email,
        phone:
          requestData.personalDetails.countryCode +
          requestData.personalDetails.phone,
        password: requestData.password,
        role: "admin",
        modules: [
          "program_schools",
          "students",
          "applications",
          "financial",
          "generate_report",
          "interview",
        ],
        password: await Common.hashPassword(requestData.password),
        notifications: {
          student: true,
          comments: true,
          commissions: true,
          agent: true,
          case: true,
          invoice: true,
          application: true,
          payments: true,
          schools: true,
          intake: true,
          document: true,
        },
      }
    );
    const token = jwt.sign(
      {
        id: staff?._id,
        email: requestData?.personalDetails?.email,
      },
      config.keys.secret,
      {
        expiresIn: "24d",
      }
    );
    const companyData = convertToCompanyData(requestData);
    const companyUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Account/${idsCollection?.companyId}`;
    const sfCompanyData = await updateDataToSF(companyData, companyUrl);
    // if (sfCompanyData && sfCompanyData.success) {
    const agentsData = convertToAgentData(
      requestData,
      idsCollection?.companyId
    );
    const agentUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Contact/${idsCollection?.contactId}`;
    await updateDataToSF(agentsData, agentUrl);
    const bankUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/BankDetail__c/${idsCollection?.bankId}`;
    const bankData = convertToBankData(requestData, "");
    await updateDataToSF(bankData, bankUrl);
    // }
    return res.status(200).json({
      data: {
        idsCollection,
        ...generateAuthResponse(staff, agent, token, idsCollection?.contactId),
      },
      statusCode: 201,
    });
  } catch (err) {
    return res.status(400).json({
      statusCode: 400,
      message: err.message,
      error: "Bad Request",
    });
  }
};

Auth.post.emailExist = async (req, res) => {
  const staff = await Staff.findOne({ email: req.body.email });
  if (staff) {
    return res.status(200).json({ data: true, statusCode: 200 });
  } else {
    return res.status(200).json({ data: false, statusCode: 200 });
  }
};

Auth.post.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = Math.floor(Math.random() * 9000) + 1000;
    await Staff.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: { passwordResetOtp: otp } }
    );
    const emailValidation = await emailValidator(email);
    if (emailValidation == false) {
      return res.status(400).json({ message: "Email format is wrong" });
    }
    const sendMailResponse = await sendEmailWithOTP(email, otp);
    if (sendMailResponse.MessageId) {
      await forgotPasswordRateLimit(email);

      return res
        .status(200)
        .json({ statusCode: 200, message: "OTP Mail Sent Successfully" });
    } else {
      return res
        .status(sendMailResponse.statusCode)
        .json({ message: "Failed to send email" });
    }
  } catch (error) {
    if (error.message === "Too many requests. Please try again later.") {
      return res.status(429).json({ statusCode: 429, message: error.message });
    } else {
      console.error("Error sending email:", error);
      return res
        .status(500)
        .json({ statusCode: 500, message: "Failed To Send OTP Mail" });
    }
  }
};

Auth.post.verifyOtp = async (req, res) => {
  const staff = await Staff.findOne({
    email: req.body.email.toLowerCase().trim(),
    passwordResetOtp: req.body.otp,
  });

  if (staff) {
    return res.status(200).json({ statusCode: 200 });
  } else {
    return res.status(200).json({
      statusCode: 403,
      message: "OTP is invalid",
      error: "Forbidden",
    });
  }
};

Auth.post.resetPassword = async (req, res) => {
  const staff = await Staff.findOneAndUpdate(
    { email: req.body.email.toLowerCase().trim() },
    {
      $set: {
        password: await Common.hashPassword(req.body.password),
        passwordResetOtp: null,
      },
    }
  );

  let agent = await Agent.findOne({ "personalDetails.email": req.body.email });

  const token = jwt.sign(
    {
      id: staff._id,
    },
    config.keys.secret,
    {
      expiresIn: "24d",
    }
  );

  if (staff) {
    return res.status(200).json({
      data: generateAuthResponse(staff, agent, token),
      statusCode: 200,
    });
  } else {
    return res.status(200).json({
      statusCode: 403,
      message: "OTP is invalid",
      error: "Forbidden",
    });
  }
};

Auth.get.tnc = async (req, res) => {
  const tncSf = await getTnc();
  // console.log("TNC SF: ", tncSf)
  // const tnc = await Config.findOne({ type: "AUTH_TNC" })
  return res.status(200).json({ data: tncSf, statusCode: 200 });
};

Auth.get.profile = async (req, res) => {
  let staff = await Staff.findOne({ email: req.user.email });
  let agent = await Agent.findOne({ "personalDetails.email": req.user.email });
  const token = jwt.sign(
    {
      id: staff._id,
      email: staff.email,
    },
    config.keys.secret,
    {
      expiresIn: "24d",
    }
  );
  return res.status(200).json({
    data: generateAuthResponse(staff, agent, token, ""),
    statusCode: 200,
  });
};

function generateAuthResponse(staff, agent, token, sfId) {
  return {
    token: token,
    sfId,
    agent,
    isDocumentsRequired: agent?.documents.length === 0,
    isTncAccepted: agent.tncMeta
      ? agent.tncMeta.isAccepted
        ? agent.tncMeta.isAccepted
        : false
      : false,
    status: agent.verificationStatus,
    details: {
      name: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      country: agent.address.country,
      companyName: agent.company.companyName,
    },
    staff: {
      id: staff.id,
      agentId: staff.agentId,
      isActive: staff.isActive,
      role: staff.role,
      modules: staff.modules,
      dp: staff.dp,
    },
  };
}

module.exports = Auth;
