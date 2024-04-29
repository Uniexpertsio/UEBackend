const mongoose = require("mongoose");

const replyCommentSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    name: { type: String, required: true },
    salesforceId: { type: String, required: false }
  },
  { timestamps: true }
);

const ReplyComment = mongoose.model("ReplyComment", replyCommentSchema);

module.exports = ReplyComment;
