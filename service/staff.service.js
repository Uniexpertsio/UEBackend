const { v4: uuidv4 } = require("uuid");
const Common = require("../controllers/Common");
const BranchService = require("../service/branch.service");
const SalesforceService = require("./salesforce.service");
const StaffModel = require("../models/Staff");
const { MappingFiles } = require("./../constants/Agent.constants");
const Agent = require("../models/Agent");
const { sendEmailToStaff } = require("../utils/sendMail");
const emailValidator = require("../utils/emailValidator");
const { ObjectId } = require("mongodb");

class StaffService {
  constructor() {
    this.staffModel = StaffModel;
    this.branchService = new BranchService();
    this.salesforceService = SalesforceService;
  }

  convertToAgentData(inputData, agentInfo, id) {
    console.log(inputData);
    const nameArr = inputData?.fullName.split(" ");
    const outputData = {
      RecordTypeId: "0125g00000020HQAAY",
      FirstName: nameArr[0],
      LastName: nameArr[1] || "N/A",
      MobilePhone: inputData?.phone,
      Branch__c: inputData?.branchId,
      // Whatsapp_No__c: inputData.personalDetails.phone,
      Email: inputData?.email,
      ...(inputData?.password && { Password__c: inputData?.password }),
      // Phone: "8987678987",
      // Birthdate: "2022-07-11", // Assuming a default value
      AccountId: id, // Assuming a default value
      Active__c: true,
      MailingCity: agentInfo?.address?.city,
      MailingState: agentInfo?.address?.state,
      MailingCountry: agentInfo?.address?.country,
      MailingStreet: agentInfo?.address?.address,
      MailingPostalCode: agentInfo?.address?.zipCode,
      Country_Code__c: inputData?.countryCode,
    };
    return outputData;
  }
  async addStaff(agentData, staffDetails, commonId) {
    let branchName = "";
    const existingEmail = await StaffModel.find({ email: staffDetails?.email });
    const existingContact = await StaffModel.find({
      phone: staffDetails?.phone,
    });
    if (existingEmail?.length > 0) {
      throw new Error("Email already exists");
    }
    if (existingContact?.length > 0) {
      throw new Error("Contact already exists");
    }

    const emailValidation = await emailValidator.validateEmail(
      staffDetails?.email
    );
    if (emailValidation == false) {
      throw new Error("Email format is wrong");
    }
    if (staffDetails?.branchId) {
      const branch = await this.branchService.findById(staffDetails?.branchId);
      branchName = branch?.name;
    }
    const externalId = uuidv4();
    let password = await Common.hashPassword(staffDetails?.password);
    let notifications = {
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
    };
    return this.staffModel
      .create({
        ...staffDetails,
        externalId,
        agentId: agentData?.agentId,
        password,
        notifications,
      })
      .then(async (staff) => {
        const agentInfo = await Agent.findById(agentData?.agentId);
        const staffData = this.convertToAgentData(
          staff,
          agentInfo,
          agentInfo?.commonId
        );
        const agentUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Contact`;
        const record = await SalesforceService.sendDataToSF(
          staffData,
          agentUrl
        );
        const updated = await StaffModel.updateOne(
          { _id: staff._id },
          { $set: { sfId: record?.id } }
        );
        const mailBody = {
          companyName: agentInfo?.company?.companyName,
          mail: staffDetails?.email,
          branchName: branchName,
          password: staffDetails?.password,
        };
        await sendEmailToStaff(mailBody);
        return staff;
      })
      .catch((error) => {
        // throw new BadRequestException(error.message);
        throw new Error(error.message);
      });
  }

  async updateStaff(agentId, staffId, staffDetails) {
    // Use Promise.all to parallelize independent tasks
    const [agentInfo, staffID] = await Promise.all([
      Agent.findById(agentId),
      StaffModel.findById(staffId, { sfId: 1 }),
    ]);

    // Check if the staff belongs to the agent (consider moving it into the parallel block if it doesn't depend on `agentInfo`)
    await this.checkIfStaffBelongsToAgent(agentId, staffId);

    // If branchId exists, verify the branch (this could also be done in parallel if you want)
    if (staffDetails.branchId) {
      await this.branchService.findById(staffDetails.branchId);
    }

    const staffData = this.convertToAgentData(
      staffDetails,
      agentInfo,
      agentInfo?.commonId
    );

    // Construct the Salesforce API URL
    const agentUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Contact/${staffID?.sfId}`;

    // Update Salesforce and MongoDB in parallel
    await Promise.all([
      SalesforceService.updateDataToSF(staffData, agentUrl),
      this.staffModel.updateOne({ _id: staffId }, { ...staffDetails }),
    ]);

    return { success: true };
  }

  async getStaff(agentId, staffId) {
    const staff = await this.findById(staffId);
    if (staff.agentId === agentId) {
      return staff;
    }
    throw StaffDoesNotBelongsToAgentException();
  }

  async changePassword(agentId, staffId, passwordDto) {
    await this.checkIfStaffBelongsToAgent(agentId, staffId);
    await this.staffModel.updateOne(
      { _id: staffId },
      { $set: { password: await Common.hashPassword(passwordDto.password) } }
    );
  }

  async updateNotifications(staffId, notificationsDto) {
    await this.staffModel.updateOne(
      { _id: staffId },
      { $set: { notifications: notificationsDto } }
    );
  }

  async changeActiveStatus(agentId, staffId, activeStatusDto) {
    await this.checkIfStaffBelongsToAgent(agentId, staffId);
    await this.staffModel.updateOne(
      { _id: staffId },
      {
        $set: { isActive: activeStatusDto.isActive, lastLoginDate: new Date() },
      }
    );
  }

  async checkIfStaffBelongsToAgent(agentId, staffId) {
    const staff = await this.staffModel.findById(staffId);
    if (staff.agentId !== agentId) {
      throw StaffDoesNotBelongsToAgentException();
    }
  }

  getAllStaff(agentId) {
    return this.staffModel.find({ agentId }).populate({
      path: "branchId",
      select: "name",
    });
  }

  findByEmail(email) {
    return this.staffModel.findOne({ email });
  }

  async findById(id) {
    const user = await this.staffModel.findById(id);

    if (!user) {
      throw new Error(id);
    }

    return user;
  }
  async findByIdForSf(id) {
    const res = await this.staffModel.findOne({ sfId: id }, { _id: 1 });
    return res;
  }

  async findByAgentId(agentId) {
    const user = await this.staffModel.find({ agentId });
    if (!user) {
      throw new Error(id);
    }

    return user;
  }

  async findByAgentIdForSf(agentId) {
    const agentData = await Agent.findOne(
      { commonId: agentId },
      { _id: 1, commonId: 1 }
    );
    const staffData = await this.staffModel.findOne({ agentId: agentData._id });
    return agentData;
  }

  queryByName(name) {
    return this.staffModel.find({ fullName: { $regex: name } });
  }

  async forgottenPassword(email) {
    const otp = "1234"; //Generate random OTP
    const result = await this.staffModel.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { passwordResetOtp: otp } }
    );
    // Send email with OTP
    if (result.modifiedCount === 0) {
      throw new Error(email);
    }
  }

  async verifyOTP(email, otp) {
    const user = await this.staffModel.findOne({
      email: email.toLowerCase().trim(),
      passwordResetOtp: otp,
    });

    if (!user) {
      throw OtpInvalidException();
    }
  }

  async resetPassword(email, password) {
    const user = await this.staffModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        $set: {
          password: await Common.hashPassword(password),
          passwordResetOtp: null,
        },
      }
    );

    if (!user) {
      throw new Error(email);
    }

    return user;
  }

  async resetPasswordotp(email, password, otp) {
    const user1 = await this.staffModel.findOne({
      email: email.toLowerCase().trim(),
      passwordResetOtp: otp,
    });

    if (!user1) {
      throw OtpInvalidException();
    } else {
      const user = await this.staffModel.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        {
          $set: {
            password: await Common.hashPassword(password),
            passwordResetOtp: null,
          },
        }
      );

      if (!user) {
        throw new Error(email);
      }

      return user;
    }
  }

  updateDp(id, dp) {
    return this.staffModel.updateOne({ _id: id }, { $set: dp });
  }
}

module.exports = StaffService;
