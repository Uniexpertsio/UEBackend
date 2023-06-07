const { isVideo } = require("../common/helpers");
const uuid = require("uuid");
const StaffService = require("../service/staff.service");
const Comment = require("../models/Comment");


class CommentService {
  constructor() {
    this.commentModel = Comment;
    this.staffService = StaffService();
  }

  async add(message, userId, relationId, attachment = "") {
    const externalId = uuid.v4();
    const comment = await this.commentModel.create({
      message,
      userId,
      relationId,
      externalId,
      attachment,
      isVideo: isVideo(attachment),
    });
    const user = await this.staffService.findById(comment.userId);
    return { comment, user };
  }

  async getByRelationId(relationId) {
    const comments = await this.commentModel.find({ relationId });
    const commentUserPromises = comments.map(async (comment) => {
      const user = await this.staffService.findById(comment.userId);
      return { comment, user };
    });
    return Promise.all(commentUserPromises);
  }

  async getComment(id) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new Error("Comment not found");
    const user = await this.staffService.findById(comment.userId);
    return { comment, user };
  }
}

module.exports = CommentService;