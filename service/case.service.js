// Importing required modules
const Application = require("../models/Application");
const Case = require("../models/Case");
const Comment = require("../models/Comment");
const Student = require("../models/Student");
const uuid = require("uuid");
const {
  getDataFromSF,
  sendDataToSF,
  updateDataToSF,
} = require("../service/salesforce.service");
const CommentService = require("./comment.service");

// Defining the CaseService class
class CaseService {
  constructor() {
    this.commentService = new CommentService();
  }

  // Method to retrieve all cases associated with a contact ID from Salesforce
  async getAllCases(contactId) {
    return await Case.find({ contactId });
  }

  // Method to get a case by its ID
  async getCaseById(id) {
    return await Case.findById(id);
  }

  // Method to create a comment for a case
  async createCaseComment(body, modifiedBy, caseId) {
    try {
      const comment = await this.commentService.add(
        body.message,
        modifiedBy,
        caseId
      );

      // Update case with the new comment
      const result = await Case.updateOne(
        { _id: caseId },
        { $push: { comments: comment.comment.id }, $set: { modifiedBy } }
      );
      if (result.modifiedCount === 0) {
        throw new Error("Case not found");
      }
      const caseData = await Case.findById(caseId);

      const data = {
        Enter_Note__c: null,
        Application__c: null,
        Partner_User__c: null,
        Lead__c: null,
        PartnerNote__c: null,
        University_Notes__c: null,
        Subject__c: "Offer Related",
        Student__c: null,
        Message_Body__c: body.message,
        Type__c: "Inbound",
        External__c: true,
        CourseEnquiry__c: null,
        Cases__c: caseData?.caseId,
      };
      const url = `${process.env.SF_API_URL}services/data/v55.0/sobjects/NoteMark__c/`;
      const sendingComment = await sendDataToSF(data, url);
      console.log(sendingComment, "sendingComment");
      if (sendingComment?.id && comment?.comment?._id) {
        await this.commentService.updateCommentSfId(
          comment?.comment?._id,
          caseData?.caseId
        );
      }
      return comment;
    } catch (error) {
      console.error("Error in addStudentComment:", error);
      throw error;
    }
  }

  // Method to retrieve comments for a case
  async getCaseComments(caseId, staffId) {
    const caseData = await Case.findById(caseId);
    const id = caseData.caseId;
    if (!caseData) throw new Error("Case not found");
    // return Promise.all(
    // caseData.comments.map(async (comment) => {
    return await this.commentService.getCaseComment(id, staffId);
    // })
    // );
  }

  // Method to retrieve reasons for cases from Salesforce
  async getReasonService() {
    try {
      const url = `${process.env.SF_API_URL}services/data/v50.0/ui-api/object-info/Case/picklist-values/012000000000000AAA/Reason`;
      const sfData = await getDataFromSF(url);
      return sfData?.values;
    } catch (err) {
      console.log(err);
    }
  }

  // Method to retrieve sub-reasons for cases from Salesforce
  async getSubReasonService() {
    try {
      const url = `${process.env.SF_API_URL}services/data/v50.0/ui-api/object-info/Case/picklist-values/012000000000000AAA/Case_Sub_Reason__c`;
      const sfData = await getDataFromSF(url);
      return sfData?.values;
    } catch (err) {
      console.log(err);
    }
  }

  // Method to convert data to format suitable for Case creation
  convertToCaseData(data) {
    const caseData = {
      ContactId: data?.contactId,
      AccountId: data?.accountId,
      Reason: data?.type,
      Subject: data?.subject,
      Priority: data?.priority,
      Description: data?.description,
      Case_Sub_Reason__c: data?.subType,
    };
    return caseData;
  }

  // Method to create a Case and send it to Salesforce
  async createCase(caseData, res) {
    try {
      // Creating a new Case document and saving it to the database
      let createCase = await new Case(caseData).save();

      // Constructing the URL for Salesforce API
      const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Case`;

      // Converting case data to a format suitable for Salesforce
      const data = this.convertToCaseData(caseData);

      // Sending case data to Salesforce
      const sfRes = await sendDataToSF(data, url);
      // If the response from Salesforce is successful
      if (sfRes && sfRes.success) {
        // Construct URL for Salesforce query
        const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Case/${sfRes?.id}`;
        // Fetch data from Salesforce
        const sfData = await getDataFromSF(url);
        // Check if sfData contains valid data
        if (sfData && sfData.Id && sfData.CaseNumber) {
          // Updating the local case document with the Salesforce case ID
          createCase = await Case.findOneAndUpdate(
            { _id: createCase._id },
            { $set: { caseId: sfData.Id, caseNumber: sfData.CaseNumber } },
            { new: true }
          );
        }
      }
      // If case creation/update was unsuccessful, return a 404 error
      if (!createCase) {
        return res
          .status(404)
          .send({ statuscode: 404, message: "Case not created" });
      }

      // Returning the created case document merged with Salesforce case data
      return { ...createCase?._doc };
    } catch (err) {
      // Handling errors by sending a 400 error response and logging the error
      res.status(400).send({ statuscode: 400, message: err.message });
      console.error("Create case error:", err);
    }
  }

  // Method to update attachment data for a case
  async updateAttachmentService(id, caseData, res) {
    try {
      let cases = await Case.findOne({ _id: caseData?._id });
      if (!cases) {
        return res
          .status(404)
          .send({ statuscode: 404, message: `No case data with this ${id}` });
      }
      cases = await Case.findOneAndUpdate(
        { _id: caseData?._id },
        {
          $set: {
            attachment: caseData?.attachment,
          },
        },
        { new: true }
      );
      const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Case/${id}`;
      const sfRes = await updateDataToSF(
        { Attachment__c: caseData?.attachment },
        url
      );
      if (!cases) {
        return res
          .status(400)
          .send({ statuscode: 400, message: "case data not updated" });
      }
      return cases;
    } catch (err) {
      res.status(500).send({ statuscode: 500, message: err.message });
      console.log("update case error:: ", err);
    }
  }

  // Method to update a case
  async updateCase(id, caseData) {
    return await Case.findByIdAndUpdate(id, caseData, { new: true });
  }

  // Method to delete a case
  async deleteCase(id) {
    return await Case.findByIdAndDelete(id);
  }

  // Method to update reply comment for a case
  async ReplyComment(commentData, id) {
    return new Promise(async (resolve, reject) => {
      try {
        const externalId = uuid.v4();
        const data = {
          name: commentData?.Created_By_Name__c,
          message: commentData?.Message_Body__c,
          isReply: true,
          externalId: externalId,
          userId: id,
        };
        let comment;
        switch (true) {
          case !!commentData?.Application__c:
            data.salesforceId = commentData.Application__c;
            comment = await Application.findOne({
              salesforceId: data.salesforceId,
            });
            data.relationId = comment?._id;
            break;
          case !!commentData?.Student__c:
            data.salesforceId = commentData.Student__c;
            comment = await Student.findOne({
              salesforceId: data.salesforceId,
            });
            data.relationId = comment?._id;
            break;
          case !!commentData?.Cases__c:
            data.salesforceId = commentData.Cases__c;
            comment = await Case.findOne({ caseId: data.salesforceId });
            data.relationId = comment?._id;
            break;
          default:
            break;
        }
        const replyComment = await new Comment(data).save();
        if (!replyComment) {
          throw new Error("Reply comment not created");
        }
        resolve({ message: "Success", status: 200 });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
}

// Exporting the CaseService class
module.exports = CaseService;
