const Task = require("../models/Task");
const DocumentService = require("../service/document.service");
const DocumentTypeService = require("../service/documentType.service");
// const CommonService = require("../service/common.service");

const uuid = require('uuid');

class TaskService {
  constructor() {
    this.documentService = new DocumentService();
    this.documentTypeService = new DocumentTypeService();
    // this.commentService = new CommonService();
  }

  async add(studentId, agentId, modifiedBy, body) {
    const externalId = uuid.v4();
    return Task.create({ ...body, studentId, modifiedBy, createdBy: modifiedBy, externalId, agentId });
  }

  async update(modifiedBy, taskId, body) {
    return Task.updateOne({ _id: taskId }, { $set: { ...body, modifiedBy } });
  }

  async addResponse(modifiedBy, taskId, data) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');
    
    if (task.responseType === 'DOCUMENT') {
      const document = await this.documentService.addDocument(modifiedBy, taskId, {
        url: data,
        documentTypeId: task.documentTypeId,
      });
      data = document.id;
    }

    let update = { modifiedBy, status: 'IN_PROGRESS' };
    if (task.responseType === 'INFORMATION') {
      update = { ...update, requestedInformation: data };
    } else if (task.responseType === 'DOCUMENT') {
      update = { ...update, documentId: data };
    }
    return Task.updateOne({ _id: taskId }, { $set: update });
  }

  async delete(taskId) {
    return Task.deleteOne({ _id: taskId });
  }

  async findById(id) {
    return Task.findById(id);
  }

  async getByStudentId(studentId, status) {
    let filter = { studentId };
    if (status) {
      filter = { ...filter, status };
    }
    return this.mapTaskDetails(await Task.find(filter));
  }

  async mapTaskDetails(tasks) {
    const detailsArray = await Promise.all(
      tasks.map(async (details) => {
        let document = null;
        if (details.documentId) {
          document = await this.documentService.findById(details.documentId);
        }
        let documentType = null;
        if (details.documentTypeId) {
          documentType = await this.documentTypeService.findById(details.documentTypeId);
        }
        let data = { ...details };
        data = data._doc;

        data.comments = await Promise.all(
          details.comments.map(async (comment) => {
            return await this.commentService.getComment(comment);
          })
        );

        data.id = data._id;
        delete data._id;
        delete data.__v;

        return {
          details: data,
          document,
          documentType,
        };
      })
    );

    return detailsArray;
  }

  async getByApplicationId(applicationId, status) {
    let filter = { applicationId };
    if (status) {
      filter = { ...filter, status };
    }
    return this.mapTaskDetails(await Task.find(filter));
  }

  async getComments(taskId) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    return Promise.all(
      task.comments.map(async (comment) => {
        return await this.commentService.getComment(comment);
      })
    );
  }

  async addComment(taskId, body, modifiedBy) {
    const comment = await this.commentService.add(body.message, modifiedBy, taskId, body.attachment);
    await Task.updateOne({ _id: taskId }, { $push: { comments: comment.comment.id }, $set: { modifiedBy } });
    return comment;
  }
}

module.exports = TaskService;
