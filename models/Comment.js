const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    name: { type: String, required: false },
    userId: { type: String, required: true },
    attachment: { type: String, required: false, default: "" },
    relationId: { type: String, required: true },
    externalId: { type: String, required: true },
    isVideo: { type: Boolean, required: false, default: false },
    salesforceId: { type:String, required:false },
    isReply: { type: Boolean, default: false},
  },
  { timestamps: true }
);

CommentSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
