const Document = require("../models/Document");
const Student = require("../models/Student");
const DocumentTypeService = require("./documentType.service");
const uuid = require("uuid");
const { getDataFromSF } = require("./salesforce.service");

class DocumentService {
  constructor() {
    this.documentTypeService = new DocumentTypeService();
  }
  async addDocuments(modifiedBy, userId, body) {
    for (const document of body.documents) {
      await this.documentTypeService.findById(
        document.documentTypeId ? document.documentTypeId : ""
      );
    }
    const documents = await Document.insertMany(
      body.documents.map((doc) => ({
        ...doc,
        userId,
        modifiedBy,
        createdBy: modifiedBy,
        externalId: uuid.v4(),
      }))
    );
    return documents;
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

  async addOrUpdateStudentDocument(modifiedBy, userId, body) {
    try {
      const updatedDocuments = [];

      for (const document of body.documents) {
        if (document.sfId && document.sfId.length) {
          const updatedDoc = await Document.findOneAndUpdate(
            { sfId: document.sfId },
            {
              $set: {
                ...document,
                userId,
                modifiedBy,
                createdBy: modifiedBy,
                externalId: uuid.v4(),
              },
            },
            { new: true, upsert: true }
          );

          updatedDocuments.push(updatedDoc);
        }
      }

      if (updatedDocuments.length > 0) {
        return updatedDocuments;
      }

      const documentsToInsert = body.documents.map((doc) => ({
        ...doc,
        userId,
        modifiedBy,
        createdBy: modifiedBy,
        externalId: uuid.v4(),
      }));

      const documents = await Document.insertMany(documentsToInsert);
      return documents;
    } catch (error) {
      console.error("Error in add Or Update Student Document:", error);
      throw new Error("Failed to add or update documents.");
    }
  }

  async addOrUpdateDocuments(modifiedBy, userId, body) {
    try {
      const updatedDocuments = [];

      for (const document of body.documents) {
        if (document.sfId && document.sfId.length) {
          const documentData = await this.documentTypeService.findByName(
            document.name ? document.name : ""
          );
          document["documentTypeId"] = documentData._id.toString();

          const updatedDoc = await Document.findOneAndUpdate(
            { sfId: document.sfId },
            {
              $set: {
                ...document,
                userId,
                modifiedBy,
                createdBy: modifiedBy,
                externalId: uuid.v4(),
              },
            },
            { new: true, upsert: true }
          );

          updatedDocuments.push(updatedDoc);
        }
      }

      if (updatedDocuments.length > 0) {
        return updatedDocuments;
      }

      const documentsToInsert = body.documents.map((doc) => ({
        ...doc,
        userId,
        modifiedBy,
        createdBy: modifiedBy,
        externalId: uuid.v4(),
      }));

      const documents = await Document.insertMany(documentsToInsert);
      return documents;
    } catch (error) {
      console.error("Error in addOrUpdateDocuments:", error);
      throw new Error("Failed to add or update documents.");
    }
  }

  async updateDocument(modifiedBy, documentId, body) {
    return await Document.updateOne(
      { _id: documentId },
      { $set: { ...body, modifiedBy } }
    );
  }
  async deleteDocument(documentId) {
    return await Document.deleteOne({ _id: documentId });
  }

  async getByUserId(userId) {
    const documents = await Document.find({ userId });
    console.log('document---', documents)
    return Promise.all(
      documents.map(async (document) => ({
        id: document._id,
        url: document.url,
        status: document.status,
        remark: document.remark,
        type: await this.documentTypeService.findByName(document?.name),
      }))
    );
  }

  async getSfDataStudentId(studentId) {
    const studentData = await Student.findById(studentId);
    console.log('studentData',studentData.salesforceId)
    const url = `${process.env.SF_API_URL}services/data/v50.0/query?q=SELECT+Id,Name,Sequence__c,Document_Category__c, Document_Type__c, Mandatory__c+FROM+Document_Master__c+WHERE+ObjectType__c='Student'+LIMIT+200`;
    const sfData = await getDataFromSF(url);
    console.log('sfData---', sfData)
    return sfData;
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
