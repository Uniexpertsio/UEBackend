const Agent = require("../models/Agent");
const Staff = require("../models/Staff");
const { MappingFiles } = require("./../constants/Agent.constants");
const { sendDataToSF } = require("../service/salesforce.service");
const Document = require("../models/Document");
const DocumentService = require("../service/document.service");
const DocumentTypeService = require("../service/documentType.service");

const { generateStaffResponseFromId } = require("../service/auth.service");

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
            // let dtype = await this.documentTypeService.findById(doc.documentTypeId);
            const data = {
              Name: doc.name,
              Lock_Record__c: false,
              Active__c: "",
              LatestDocumentId__c: "",
              ReviewRemarks__c: "",
              BypassDocumentation__c: false,
              Status__c: doc.status,
              IsPublic__c: "",
              IsNewDoc__c: true,
              FileType__c: "",
              ExpiryDate__c: "2023-01-25",
              Is_Downloaded__c: false,
              Sequence__c: 30,
              Mandatory__c: true,
              Entity_Type__c: "", //Individual,Private,Proprietor,Partnership,Trust
              ObjectType__c: "", //Student,Application,Agent
              Account__c: agent.commonId,
              School__c: "",
              Student__c: "",
              Application__c: "",
              Programme__c: "",
              S3_DMS_URL__c: doc.url,
              ContentUrl__c: doc.url
            };
            let sfIdFound = false;

            for (const document of body.documents) {
              if (document.sfId) {
                const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c/${document.sfId}`;
                console.log(data);
                const sfRes = await sendDataToSF(data, url);
                sfIdFound = true; // Set the flag to true if sfId is found
              }
            }

            if (!sfIdFound) {
              const url = `${process.env.SF_API_URL}services/data/v50.0/sobjects/DMS_Documents__c`;
              console.log(data);
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
