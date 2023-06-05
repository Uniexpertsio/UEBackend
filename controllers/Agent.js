const Agent = require("../models/Agent");
const { MappingFiles } = require('./../constants/Agent.constants');
const Staff = require("../models/Staff");
const { sendToSF }  = require("../service/salesforce.service");
const DocumentService = require('../service/document.service');
const DocumentTypeService = require('../service/documentType.service');
const AgentService = require('../service/agent.service');

const documentService = new DocumentService();
const documentTypeService = new DocumentTypeService();
const agentService = new AgentService();


const {
    generateAuthResponse,
    generateToken
  } = require("../service/auth.service")

const acceptTnc = async (req, res, next) => {
	try{
        const { id, agentId } = req.user;
        console.log("Agent Id: " + agentId, id);
        const agent = await Agent.findByIdAndUpdate(agentId, { tncMeta: req.body });

        if (!agent) throw new Error("Agent not found");
        const staff = await Staff.findById(id);
        const token = await generateToken(agentId, )
        const staffResponse = generateAuthResponse(staff, agent, token);
        //sendToSF(MappingFiles.AGENT_account, { ...req.body, externalId: agent.commonId });
		return res.status(200).json({statusCode: 200, data: staffResponse})
	}catch(err){
		return res.status(200).json({statusCode: 400, message: err.message})
	}
}

const getGeneralInformation = async (req, res, next) => {
	try{
        const { agentId } = req.user;
        const agent = await Agent.findById(agentId);
        if (!agent) throw "Agent not found";
        return res.status(200).json({ statusCode: 200, data: agent.getGeneralInformation() });
	}catch(err){
        return res.status(200).json({ statusCode: 400, message: err.message});
	}
}

const updateGeneralInformation = async (req, res) => {
        const { agentId } = req.user;
        const result = await Agent.findOneAndUpdate({ _id: agentId }, { $set: { ...req.body } });
        if (!result) return res.status(200).json({ statusCode: 400, message: "Bad Request" })

        if (result.modifiedCount === 0) {
            return res.status(200).json({ statusCode: 400, message: "Agent not found" })
        }

       // sendToSF(MappingFiles.AGENT_account, { ...req.body, externalId, _user: { agentId: id }  });

        return res.status(200).json({ statusCode: 200, data: result });
}


const getBankInformation = async (req, res) => {
    const { agentId } = req.user;
    const agent = await Agent.findById(agentId);
    if (!agent) {
        return res.status(200).json({ statusCode: 400, message: "Agent not found" })
    }

    return res.status(200).json({ statusCode: 400, data: agent.getBankInformation() });
};

const updateBankInformation = async(req, res)=> {
    const {id, agentId} = req.user;
    const result = await Agent.updateOne({ _id: agentId }, { $set: { bank: req.body } });

    if (result.modifiedCount === 0) {
        return res.status(200).json({ statusCode: 400, message: "Agent not found" })
    }
    //sendToSF(MappingFiles.AGENT_bank, { bank: req.body, externalId, _user: { agentId: id }  });

    return res.status(200).json({ statusCode: 200, data: result });

}

const getAccountManager = async (req, res) => {
    const { agentId } = req.user;
    const agent = await Agent.findById(agentId);
    if (!agent) {
        return res.status(200).json({ statusCode: 400, message: "Agent not found" })
    }
    if (agent.accountManager) {
      return Staff.findById(agent.accountManager);
    } else {
        return res.status(200).json({statusCode: 400, message: "Account manager not found"});
    }
};

const updateDocuments = async (req, res) => {
    try{
        const {id, agentId } = req.user;
        const updateDocumentsResponse = await agentService.updateDocuments(id, agentId, req.body);
        return res.status(200).json({ statusCode: 200, data: updateDocumentsResponse })
    }catch(err){
        return res.status(200).json({ statusCode: 200, message: err.message })
    }   
};

const updateDocument = async (req, res) => {
    try{
        const {id, agentId } = req.user;
        const updateDocumentsResponse = await documentService.updateDocument(id, req.params.documentId, req.body);
        return res.status(200).json({ statusCode: 200, data: updateDocumentsResponse })
    }catch(err){
        return res.status(200).json({ statusCode: 200, message: err.message })
    }   
};

const getDocuments = async (req, res) => {
    try{
        const {agentId } = req.user;
        const documents = await documentService.getByUserId(agentId);
        return res.status(200).json({ statusCode: 200, data: documents })
    }catch(err){
        return res.status(200).json({ statusCode: 200, message: err.message })
    }   
};



module.exports = {
    acceptTnc,
    getGeneralInformation,
    updateGeneralInformation,
    getBankInformation,
    updateBankInformation,
    getAccountManager,
    updateDocument,
    updateDocuments,
    getDocuments
}
