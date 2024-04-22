const DocumentType = require("../models/DocumentType");
const Agent = require("../models/Agent");
const { getDataFromSF } = require("./salesforce.service");

/// add country to logic in creation of the docs

class DocumentTypeService {
  async getStudentDocumentType() {
    try {
      // return await DocumentType.find({
      //   contactRecordType: "Student",
      //   isActive: true,
      //   objectType: "Student",
      // });
      const data = await getDataFromSF(`${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,Name,Sequence__c,Document_Category__c, Document_Type__c,Mandatory__c,Used_For__c,ObjectType__c,Contact_Record_Type__c+FROM+Document_Master__c+WHERE+ObjectType__c='Student'+AND+Contact_Record_Type__c+=+'Student'+LIMIT+200`);
      return data;
    } catch(error) {
      throw error;
    }
  }

  async addDocumentType(documentType) {
    return await DocumentType.create(documentType);
  }

  async getStudentApplicationDocumentType() {
    return DocumentType.find({
      contactRecordType: "Student",
      isActive: true,
      objectType: "Application",
    });
  }

  async findById(id) {
    const documentType = await DocumentType.findById(id);
    if (!documentType) throw new Error("Document type not found");
    return documentType;
  }

  async findAgentById(id) {
    const user = await Agent.findById(id);
    if (!user) {
      throw new Error("Agent not found with id: " + id);
    }

    return user;
  }

  async findByName(name) {
    const documentType = await DocumentType.findOne({ name: name });
    if (!documentType) throw new Error("Document type not found");
    return documentType;
  }
  async getPartnerDocumentType(agentId) {
    const agent = await this.findAgentById(agentId);
    const country = agent.address.country;
    return DocumentType.find({
      $or: [
        { country: { $in: country.toLowerCase() } },
        { country: { $in: "All" } },
      ],
      contactRecordType: "Partner",
      isActive: true,
    });
  }
}

module.exports = DocumentTypeService;
