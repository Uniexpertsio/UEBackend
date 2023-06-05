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
          // sendToSF(MappingFiles.AGENT_document, { ...doc, documentTypeId: dtype.externalId, documentTypeName: dtype.name, _user: { agentId, id: (await Staff.findById(id)).externalId } });
        });
        const agent = await Agent.findById(agentId);
        if (!agent) throw "Agent not found";
        return generateStaffResponseFromId(id, agent);
      }
}

module.exports = AgentService;
