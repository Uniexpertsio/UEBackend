const { v4: uuidv4 } = require("uuid");
const Common = require("../controllers/Common");
const BranchService = require("../service/branch.service");
const SalesforceService = require("./salesforce.service");
const StaffModel = require("../models/Staff");
const { MappingFiles } = require("./../constants/Agent.constants");
const Agent = require("../models/Agent");
const { sendEmailToStaff } = require("../utils/sendMail");

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
      Password__c: inputData?.password,
      // Phone: "8987678987",
      // Birthdate: "2022-07-11", // Assuming a default value
      AccountId: id, // Assuming a default value
      Active__c: true,
      MailingCity: agentInfo?.address?.city,
      MailingState: agentInfo?.address?.state,
      MailingCountry: agentInfo?.address?.country,
      MailingStreet: agentInfo?.address?.address,
      MailingPostalCode: agentInfo?.address?.zipCode,
    };
    return outputData;
  }
  async addStaff(agentData, staffDetails, commonId) {
    let branchName = "";
    if (staffDetails.branchId) {
      const branch = await this.branchService.findById(staffDetails.branchId);
      branchName = branch?.name;
    }
    const externalId = uuidv4();
    let password = await Common.hashPassword(staffDetails.password);
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
        const agentInfo = await Agent.findById(agentData?.agentId)
        console.log('agentInfo>>>', agentInfo.company.companyName)
        const staffData = this.convertToAgentData(staff, agentInfo, agentInfo?.commonId);
        const agentUrl = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Contact`;
        await SalesforceService.sendDataToSF(staffData, agentUrl);
        const mailBody = {
          companyName: agentInfo?.company?.companyName,
          mail: staffDetails?.email,
          branchName: branchName,
          password: staffDetails?.password
        }
        console.log('mailBody',mailBody)
        const sendMail = await sendEmailToStaff(mailBody);
        console.log('sendMail',sendMail)
        return staff;
      })
      .catch((error) => {
        // throw new BadRequestException(error.message);
        throw new Error(error.message);
      });
  }

  async updateStaff(agentId, staffId, staffDetails) {
    await this.checkIfStaffBelongsToAgent(agentId, staffId);
    if (staffDetails.branchId) {
      await this.branchService.findById(staffDetails.branchId);
    }
    //this.salesforceService.sendToSF(MappingFiles.AGENT_staff, staffDetails);
    return this.staffModel.updateOne({ _id: staffId }, { ...staffDetails });
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
      { $set: { isActive: activeStatusDto.isActive } }
    );
  }

  async checkIfStaffBelongsToAgent(agentId, staffId) {
    const staff = await this.staffModel.findById(staffId);
    if (staff.agentId !== agentId) {
      throw StaffDoesNotBelongsToAgentException();
    }
  }

  getAllStaff(agentId) {
    return this.staffModel.find({ agentId });
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
  async findByAgentId(agentId) {
    const user = await this.staffModel.find({ agentId });

    if (!user) {
      throw new Error(id);
    }

    return user;
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
