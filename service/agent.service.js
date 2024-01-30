const Agent = require("../models/Agent");
const Staff = require("../models/Staff");
const { MappingFiles } = require('./../constants/Agent.constants');
const { sendDataToSF }  = require("../service/salesforce.service");
const DocumentService = require('../service/document.service');
const DocumentTypeService = require('../service/documentType.service');

const {
    generateStaffResponseFromId
  } = require("../service/auth.service")

class AgentService{
    
    constructor(){
        this.documentService = new DocumentService();
        this.documentTypeService = new DocumentTypeService();
    }


    async updateDocuments(id, agentId, body) {
      const sfBody = {
        "Name": "Air Ticket test 2",
        "Lock_Record__c": false,
        "Active__c":"",
        "LatestDocumentId__c": "sqssm",
        "ReviewRemarks__c": "13",
        "BypassDocumentation__c": false,
        "WriteIntegrationMessage__c": "xxxqwx",
        "GetIntegrationMessage__c": "cccqwsqsq",
        "SharepointStatus__c": "Pending",
        "Status__c": "Pending",
        "IsPublic__c":"",
        "IsNewDoc__c": true,
        "FileType__c": "LLLL",
        "ExpiryDate__c": "2023-01-25",
        "Is_Downloaded__c": false,
        "Sequence__c": 30,
        //Fill  below fields to specify the for which Entity this Document is associated
        "Account__c": "",
        "School__c": "",
        "Student__c":"",
        "Document_Master__c":"",
        "Application__c": "",
        "Programme__c":"a01Hy00000OZJhvIAH"
      }
        const documents = await this.documentService.addDocuments(id, agentId, body);
        const documentIds = documents.map((document) => document.id);
        await Agent.updateOne({ _id: agentId }, { $set: { documents: documentIds } });
        documents.forEach(async (doc) => {
          let dtype = await this.documentTypeService.findById(doc.documentTypeId);

          
          const url = "https://uniexperts--uxuat.sandbox.my.salesforce.com/services/data/v50.0/sobjects/DMS_Documents__c";
          const sfRes = await sendDataToSF(sfBody, url);
          //console.log("sfRes: ", sfRes)
        });

        const agent = await Agent.findById(agentId);
        if (!agent) throw "Agent not found";
        return generateStaffResponseFromId(id, agent);
      }
}

module.exports = AgentService;
