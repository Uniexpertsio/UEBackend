const Case = require("../models/Case");
const Comment = require("../models/Comment");
const ReplyComment = require("../models/replyComment");
const {
  getDataFromSF,
  sendDataToSF,
  updateDataToSF,
} = require("../service/salesforce.service");
const CommentService = require("./comment.service");

class CaseService {
  constructor() {
    this.commentService = new CommentService();
  }

  async getAllCases(contactId) {
    const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+ Id,ContactId,CaseNumber,AccountId,Reason,Subject,Priority,Description,Case_Sub_Reason__c,Attachment__c,Status,Account_Name__c,Contact_Name__c+FROM+case+where+ContactId+=+'${contactId}'`;
    const sfData = await getDataFromSF(url);
    if (sfData && sfData?.records?.length > 0) {

      const operations = sfData.records.map(async (data) => {
        try {
          const payload = {
            caseId: data?.Id,
            contactId: data?.ContactId,
            accountId: data?.AccountId,
            type: data?.Reason,
            subject: data?.Subject,
            priority: data?.Priority,
            description: data?.Description,
            subType: data?.Case_Sub_Reason__c,
            attachment: data?.Attachment__c,
            status: data?.Status,
            accountName: data?.Account_Name__c,
            contactName: data?.Contact_Name__c,
            caseNumber: data?.CaseNumber,
          }
          const ifexist = await Case.find({ caseId: data?.Id });
          if (ifexist && ifexist?.length > 0) {
            await Case.updateOne({ caseId: data?.Id }, payload);
          }
          else {
            await new Case(payload).save();
          }

          console.log(`Successfully updated/inserted document with Id`);
        } catch (error) {
          console.error(`Error updating`, error);
        }
      });
      // Wait for all update operations to complete
      await Promise.all(operations);

    }
    return await Case.find({ contactId });
  }

  async getCaseById(id) {
    return await Case.findById(id);
  }

  async createCaseComment(body, modifiedBy, caseId) {
    try {
      // Add comment
      const comment = await this.commentService.add(body.message, modifiedBy, caseId);

      // Update student with the new comment
      const result = await Case.updateOne(
        { _id: caseId },
        { $push: { comments: comment.comment.id }, $set: { modifiedBy } }
      );
      // Check if student was found and updated
      if (result.modifiedCount === 0) {
        throw new Error("Case not found");
      }
      const caseData = await Case.findById(caseId);


      // Prepare data for sending to Salesforce
      const data = {
        "ParentId": caseData?.caseId, //Case SF Id
        "IsPublished": false, //To set Public Set it as 'true' otherwise 'false'
        "CommentBody": body?.message, //Comment
      }
      // Send comment data to Salesforce endpoint
      const url = `${process.env.SF_API_URL}services/data/v55.0/sobjects/CaseComment`;
      const sendingComment = await sendDataToSF(data, url);
      if (sendingComment?.id && comment?.comment?._id) {
        await this.commentService.updateCommentSfId(comment?.comment?._id, sendingComment?.id)
      }
      return comment;
    } catch (error) {
      // Handle errors
      console.error('Error in addStudentComment:', error);
      throw error; // Rethrow the error for the caller to handle
    }
  }

  
  async getCaseComments(caseId) {
    const caseData = await Case.findById(caseId);
    if (!caseData) throw new Error("Case not found");
    return Promise.all(
      caseData.comments.map(async (comment) => {
        return await this.commentService.getComment(comment);
      })
    );
  }

  async getReasonService() {
    try {
      const url = `${process.env.SF_API_URL}services/data/v50.0/ui-api/object-info/Case/picklist-values/012000000000000AAA/Reason`;
      const sfData = await getDataFromSF(url);
      return sfData?.values;
    } catch (err) {
      console.log(err);
    }
  }

  async getSubReasonService() {
    try {
      const url = `${process.env.SF_API_URL}services/data/v50.0/ui-api/object-info/Case/picklist-values/012000000000000AAA/Case_Sub_Reason__c`;
      const sfData = await getDataFromSF(url);
      return sfData?.values;
    } catch (err) {
      console.log(err);
    }
  }

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


  
  // Async function to create a Case and send it to Salesforce
async  createCase(caseData, res) {
  try {
    // Creating a new Case document and saving it to the database
  let createCase = await new Case(caseData).save();

    // Constructing the URL for Salesforce API
    const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Case`;

    // Converting case data to a format suitable for Salesforce
    const data = this.convertToCaseData(caseData);

    // Sending case data to Salesforce
    const sfRes = await sendDataToSF(data, url);
    console.log(sfRes);
    let caseDatafromSf;

    // If the response from Salesforce is successful
    if (sfRes && sfRes.success) {
       // Updating the local case document with the Salesforce case ID
       createCase = await Case.findOneAndUpdate(
        { _id: createCase._id },
        { $set: { caseId: sfRes?.Id } }
      );
    }

    // If case creation/update was unsuccessful, return a 404 error
    if (!createCase) {
      return res
        .status(404)
        .send({ statuscode: 404, message: "Case not created" });
    }

    // Returning the created case document merged with Salesforce case data
    return { ...createCase?._doc, ...caseDatafromSf };
  } catch (err) {
    // Handling errors by sending a 400 error response and logging the error
    res.status(400).send({ statuscode: 400, message: err.message });
    console.error("Create case error:", err);
  }
}


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

  async updateCase(id, caseData) {
    return await Case.findByIdAndUpdate(id, caseData, { new: true });
  }

  // async updateCase(id, caseData, res) {
  //   try {
  //     let cases = await Case.findOne({ _id: caseData?._id });
  //     if (!cases) {
  //       return res
  //         .status(404)
  //         .send({ statuscode: 404, message: `No case data with this ${id}` });
  //     }
  //     cases = await Case.findOneAndUpdate(
  //       { _id: caseData?._id },
  //       {
  //         $set: {
  //           attachment: caseData?.attachment,
  //         },
  //       },
  //       { new: true }
  //     );
  //     const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Case/${caseData?.id}`;
  //     const sfRes = await updateDataToSF(
  //       { Attachment__c: caseData?.attachment },
  //       url
  //     );
  //     if (!cases && !sfRes) {
  //       return res
  //         .status(400)
  //         .send({ statuscode: 400, message: "case data not updated" });
  //     }
  //     return res.status(200).send({
  //       statuscode: 200,
  //       message: "Case data updated succesfully",
  //       data: cases,
  //     });
  //   } catch (err) {
  //     res.status(500).send({ statuscode: 500, message:err.message });
  //     console.log("update case error:: ", err);
  //   }
  // }

  async deleteCase(id) {
    return await Case.findByIdAndDelete(id);
  }

  async updateReplyComment(sfId, commentData) {
    return new Promise(async (resolve, reject) => {
      try {
        const replyComment = await new ReplyComment(commentData).save();
        if (!replyComment) {
          throw new Error('Reply comment not created');
        }
        await Comment.findOneAndUpdate(
          { commentSfId: sfId }, 
          { $push: { replyComment: replyComment._id } }, 
          { new: true })
        resolve({ message: "Success", status: 200, sf: sfId });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
}

module.exports = CaseService;
