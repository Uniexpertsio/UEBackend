const { v4: uuidv4 } = require("uuid");
const Common = require("../controllers/Common");
const BranchService = require("../service/branch.service");
const SalesforceService = require("./salesforce.service");
const StaffModel = require("../models/Staff");
const { MappingFiles } = require('./../constants/Agent.constants');

class StaffService {
  constructor() {
    this.staffModel = StaffModel;
    this.branchService = BranchService;
    this.salesforceService = SalesforceService;
  }

  async addStaff(agentId, staffDetails) {
    if (staffDetails.branchId) {
      await this.branchService.findById(staffDetails.branchId);
    }
    const externalId = uuidv4();
    return this.staffModel
      .create({
        ...staffDetails,
        externalId,
        agentId,
        password: await Common.hashPassword(staffDetails.password),
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
      })
      .then(async (staff) => {
       // this.salesforceService.sendToSF(MappingFiles.AGENT_staff, staff);
        return staff;
      })
      .catch((error) => {
        throw new BadRequestException(error.message);
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
    await this.staffModel.updateOne({ _id: staffId }, { $set: { notifications: notificationsDto } });
  }

  async changeActiveStatus(agentId, staffId, activeStatusDto) {
    await this.checkIfStaffBelongsToAgent(agentId, staffId);
    await this.staffModel.updateOne({ _id: staffId }, { $set: { isActive: activeStatusDto.isActive } });
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
