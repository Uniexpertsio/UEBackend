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

        const documents = await this.documentService.addDocuments(id, agentId, body);
        const documentIds = documents.map((document) => document.id);
        await Agent.updateOne({ _id: agentId }, { $set: { documents: documentIds } });
        const agent = await Agent.findById(agentId);
        if (!agent) throw "Agent not found";
        documents.forEach(async (doc) => {
          let dtype = await this.documentTypeService.findById(doc.documentTypeId);
         // console.log("doc: " + doc)
          
          const data = {
            "Name": doc.name,
            "Lock_Record__c": false,
            "Active__c":"",
            "LatestDocumentId__c": "",
            "ReviewRemarks__c": "",
            "BypassDocumentation__c": false,
            "Status__c": doc.status,
            "IsPublic__c":"",
            "IsNewDoc__c": true,
            "FileType__c": "",
            "ExpiryDate__c": "2023-01-25",
            "Is_Downloaded__c": false,
            "Sequence__c": 30,
            "Mandatory__c":true,
            "Entity_Type__c":"",//Individual,Private,Proprietor,Partnership,Trust
            "ObjectType__c":"",//Student,Application,Agent
            "Account__c": agent.commonId,
            "School__c": "",
            "Student__c":"",
            "Document_Master__c":"",
            "Application__c": "",
            "Programme__c":"",
            "S3_DMS_URL__c": doc.url
          }

       
          const url = "https://uniexperts--uxuat.sandbox.my.salesforce.com/services/data/v50.0/sobjects/DMS_Documents__c";
          const sfRes = await sendDataToSF(data, url);
          console.log("sfRes: ", sfRes)
        });

       
        return generateStaffResponseFromId(id, agent);
      }
}

module.exports = AgentService;
