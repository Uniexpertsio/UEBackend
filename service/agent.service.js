const Agent = require("../models/Agent");
const Staff = require("../models/Staff");
const { MappingFiles } = require('./../constants/Agent.constants');
const { sendToSF }  = require("../service/salesforce.service");
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
        documents.forEach(async (doc) => {
          let dtype = await this.documentTypeService.findById(doc.documentTypeId);

          // "{
          //   ""Name"":""test new this"",
          //   ""LatestDocumentId__c"":""069N0000002Etx9IAC"",
          //   ""BypassDocumentation__c"":false,
          //   ""SharepointStatus__c"":""Pending"",
          //   ""Status__c"":""Uploaded"",
          //   ""IsNewDoc__c"":true,
          //   ""FileType__c"":"".docx"",
          //   ""Is_Downloaded__c"":false,
          //   ""Student__r"": {
          //           ""ExternalId__c"" :""a6283122-3a5c-f452-9518-dce12ec59f25""
          //       },
          //   ""Used_For__c"":""Application"",
          //   ""Sequence__c"":51
          //   }
            
          //   EndPointUrl For Patch:-- https://uniexperts--dev.sandbox.my.salesforce.com/services/data/v55.0/sobjects/DMS_Documents__c/ExternalId__c/e4433a12-51b8-1adc-c4f5-0f1f0842a973
          //    Headers:
          //           Content-Type:-application/json
          //           Authorization:- Bearer 00DN0000000cDM4!ASAAQCPueQ1kguX04emRQIWIniLncCALulkTnxpFZRfmwXZYpD2UGMiCr.NyZzgt0_eK_lJd0SHibPrHZksH7eOPpncSXTX2"			
          const url = "DMS_Documents__c/ExternalId__c/e4433a12-51b8-1adc-c4f5-0f1f0842a973"
          const bf = await sendToSF(MappingFiles.AGENT_document, { ...doc, documentTypeId: dtype.externalId, documentTypeName: dtype.name, _user: { agentId, id: (await Staff.findById(id)).externalId }, url });
          console.log("bf: ", bf)
        });

        const agent = await Agent.findById(agentId);
        if (!agent) throw "Agent not found";
        return generateStaffResponseFromId(id, agent);
      }
}

module.exports = AgentService;
