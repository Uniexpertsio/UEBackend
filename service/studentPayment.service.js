const { v4: uuidv4 } = require("uuid");
const StudentPayment = require("../models/StudentPayment");

class StudentPaymentService {
  constructor() {
    this.paymentModel = StudentPayment;
  }

  async add(studentId, programmeId, schoolId, modifiedBy, body) {
    const externalId = uuidv4();
    return await this.paymentModel.create({
      ...body,
      studentId,
      modifiedBy,
      createdBy: modifiedBy,
      externalId,
      programmeId,
      schoolId,
    });
  }

  async addApplicationPayment(applicationId, studentId, schoolId, programmeId, modifiedBy, currency, body) {
    const externalId = uuidv4();
    return await this.paymentModel.create({
      ...body,
      applicationId,
      modifiedBy,
      createdBy: modifiedBy,
      externalId,
      studentId,
      schoolId,
      programmeId,
      currency,
    });
  }

  async update(modifiedBy, paymentId, body) {
    return await this.paymentModel.findOneAndUpdate({ _id: paymentId }, { $set: { ...body, modifiedBy } });
  }

  async delete(paymentId) {
    return await this.paymentModel.deleteOne({ _id: paymentId });
  }

  async getByStudentId(studentId) {
    return await this.paymentModel.find({ studentId });
  }

  async getByApplicationId(applicationId) {
    return await this.paymentModel.find({ applicationId });
  }
}

module.exports = StudentPaymentService;
