const Agent = require("../models/Agent");
const Staff = require("../models/Staff");
const { MappingFiles } = require("./../constants/Agent.constants");
const { sendDataToSF } = require("../service/salesforce.service");
const Document = require("../models/Document");
const DocumentService = require("../service/document.service");
const DocumentTypeService = require("../service/documentType.service");

const { generateStaffResponseFromId } = require("../service/auth.service");
const { getFileExtension } = require("../utils/fileExtention");

class AgentService {
  constructor() {
    this.documentService = new DocumentService();
    this.documentTypeService = new DocumentTypeService();
  }

  async updateDocuments(id, agentId, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const agent = await Agent.findById(agentId);
        if (!agent) throw "Agent not found";
        const documents = await this.documentService.addOrUpdateDocuments(
          id,
          agentId,
          body
        );
        const documentIds = documents.map((document) => document.id);
        await Agent.updateOne(
          { _id: agentId },
          { $set: { documents: documentIds } }
        );
        await Promise.all(
          documents.map(async (doc) => {
            const fileExtension = await getFileExtension(doc.url);
            const data = {
              Name: doc.name,
              ReviewRemarks__c: "",
              Status__c: doc.status,
              IsNewDoc__c: true,
              FileType__c: fileExtension,
              ExpiryDate__c: "2023-01-25",
              Sequence__c: 30,
              Mandatory__c: true,
              Entity_Type__c: "", //Individual,Private,Proprietor,Partnership,Trust
              ObjectType__c: "", //Student,Application,Agent
              Account__c: agent.commonId,
              S3_DMS_URL__c: doc.url,
              ContentUrl__c: doc.url
            };
            let sfIdFound = false;

            if (doc.sfId) {
              const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c/${doc.sfId}`;
              const sfRes = await sendDataToSF(data, url);
              sfIdFound = true; // Set the flag to true if sfId is found
            }

            if (!sfIdFound) {
              const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c`;
              const sfRes = await sendDataToSF(data, url);
              doc["sfId"] = sfRes.id;
              await Document.findOneAndUpdate(
                { _id: doc._id },
                { $set: { sfId: sfRes.id } },
                { new: true }
              );
            }
          })
        );
        resolve(documents);

        // return generateStaffResponseFromId(id, agent);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }

  async findById(id) {
    const user = await Agent.findById(id);

    if (!user) {
      throw new Error(id);
    }

    return user;
  }
}

module.exports = AgentService;
