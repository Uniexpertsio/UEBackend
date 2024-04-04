const Case = require("../models/Case");
const {
  getDataFromSF,
  sendDataToSF,
  updateDataToSF,
} = require("../service/salesforce.service");

class CaseService {
  async getAllCases(contactId) {
    const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+ Id,ContactId,CaseNumber,AccountId,Reason,Subject,Priority,Description,Case_Sub_Reason__c,Attachment__c,Status,Account_Name__c,Contact_Name__c+FROM+case+where+ContactId+=+'${contactId}'`;
    const sfData = await getDataFromSF(url);
    console.log("======================>",sfData);
    if (sfData && sfData?.records?.length > 0) {

      const operations = sfData.records.map(async (data) => {
        try {
          const payload={
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
          const ifexist=await Case.find({caseId:data?.Id});
          if(ifexist && ifexist?.length>0){
            await Case.updateOne({caseId:data?.Id},payload);
          }
          else{
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
    return await Case.find({contactId});
  }

  async getCaseById(id) {
    return await Case.findById(id);
  }

  // async createCase(caseData) {
  //   return await Case.create(caseData);
  // }

  async getReasonService() {
    try {
      const url = `${process.env.SF_API_URL}services/data/v50.0/ui-api/object-info/Case/picklist-values/012000000000000AAA/Reason`;
      const sfData = await getDataFromSF(url);
      return sfData;
    } catch (err) {
      console.log(err);
    }
  }

  async getSubReasonService() {
    try {
      const url = `${process.env.SF_API_URL}services/data/v50.0/ui-api/object-info/Case/picklist-values/012000000000000AAA/Case_Sub_Reason__c`;
      const sfData = await getDataFromSF(url);
      return sfData;
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

  async createCase(caseData, res) {
    try {
      let createCase = await new Case(caseData).save();
      const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/Case`;
      const data = this.convertToCaseData(caseData);
      // console.log(caseData);
      const sfRes = await sendDataToSF(data, url);
      let caseDatafromSf;
      if (sfRes && sfRes.success) {
        caseDatafromSf = await getDataFromSF(
          `${process.env.SF_API_URL}services/data/v50.0/sobjects/Case/${sfRes.id}`
        );
        console.log(caseDatafromSf);
        if (caseDatafromSf && caseDatafromSf?.Id) {
          createCase = await Case.findOneAndUpdate(
            { _id: createCase._id },
            { $set: { caseId: caseDatafromSf?.Id } }
          );
        }
      }

      if (!createCase) {
        return res
          .status(404)
          .send({ statuscode: 404, message: "not created" });
      }
      return { ...createCase?._doc, ...caseDatafromSf };
    } catch (err) {
      res.status(400).send({ statuscode: 400, message: err.message });
      console.log("create case error", err);
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
}

module.exports = CaseService;
