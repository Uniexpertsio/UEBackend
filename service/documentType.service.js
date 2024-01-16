const DocumentType = require("../models/DocumentType");
const Agent = require("../models/Agent");


/// add country to logic in creation of the docs

Country 
Country__c



class DocumentTypeService{
    async getStudentDocumentType() {
        return await DocumentType.find({
          contactRecordType: "Student",
          isActive: true,
          objectType: 'Student'
        });
      }

      async addDocumentType(documentType) {
        return await DocumentType.create(documentType);
      }
    
    async getStudentApplicationDocumentType() {
        return DocumentType.find({
          contactRecordType: "Student",
          isActive: true,
          objectType: 'Application'
        });
      }
    
    async findById(id) {
        const documentType = await DocumentType.findById(id);
        if (!documentType) throw new Error("Document type not found");
        return documentType;
      }
    
    async findAgentById(id){
        const user = await Agent.findById(id);
        if (!user) {
          throw new Error("Agent not found with id: "+id);
        }
    
        return user;
      }
    
    async getPartnerDocumentType(agentId) {
        const agent = await this.findAgentById(agentId);
        const country = agent.address.country;
        return DocumentType.find({
          $or: [{ country: { $in: country.toLowerCase() } }, { country: { $in: "All" } }],
          contactRecordType: "Partner",
          isActive: true,
        });
      }
}


module.exports = DocumentTypeService;


