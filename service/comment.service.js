const uuid = require("uuid");
const StaffService = require("./staff.service");
const Comment = require("../models/Comment");

class CommentService {
  constructor() {
    this.commentModel = Comment;
    this.staffService = new StaffService();
    this.videos = ["mp4", "3gp", "ogg"];
  }

  isVideo(url) {
    const splits = url.split(".");
    const extension = splits[splits.length - 1];
    return videos.includes(extension);
  }

  async add(message, userId, relationId) {
    const externalId = uuid.v4();
    const comment = await this.commentModel.create({
      message,
      userId,
      relationId,
      externalId,
      isVideo: false,
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

  async updateCommentSfId(id, sfId) {
    return await this.commentModel.updateOne(
      { _id: id },
      { $set: { commentSfId: sfId } }
    );
  }

  async getComment(id) {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new Error("Comment not found");
    const user = await this.staffService.findById(comment.userId);
    return { comment, user };
  }
}

module.exports = CommentService;
