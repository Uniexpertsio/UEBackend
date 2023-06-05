const Document = require("../models/Document");
const DocumentTypeService = require("./documentType.service");
const uuid = require("uuid");

class DocumentService{
    constructor(){
      this.documentTypeService = new DocumentTypeService();
    }
    async addDocuments(modifiedBy, userId, body){
        for (const document of body.documents) {
          await this.documentTypeService.findById(document.documentTypeId ?? "");
        }
        return await Document.insertMany(
          body.documents.map((doc) => ({
            ...doc,
            userId,
            modifiedBy,
            createdBy: modifiedBy,
            externalId: uuid.v4()
          }))
        );
      }
    
      async addDocument(modifiedBy, userId, body) {
        const externalId = uuid.v4();
        return await Document.create({
          ...body,
          userId,
          modifiedBy,
          createdBy: modifiedBy,
          externalId,
        });
      }
    
      async updateDocument(modifiedBy, documentId, body) {
        return await Document.updateOne({ _id: documentId }, { $set: { ...body, modifiedBy } });
      }  
      async deleteDocument(documentId) {
        return await Document.deleteOne({ _id: documentId });
      }
    
      async getByUserId(userId) {
        const documents = await Document.find({ userId });
        return Promise.all(
          documents.map(async (document) => ({
            id: document._id,
            url: document.url,
            status: document.status,
            remark: document.remark,
            type: await this.documentTypeService.findById(document.documentTypeId),
          }))
        );
      }
    
      async findById(id) {
        const document = await Document.findById(id);
        if (!document) throw new Error("Document not found");
        return {
          id: document._id,
          url: document.url,
          status: document.status,
          remark: document.remark,
          type: await this.documentTypeService.findById(document.documentTypeId),
        };
      }
}


module.exports = DocumentService;