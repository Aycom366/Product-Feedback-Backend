const mongoose = require("mongoose");

const subCommentSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const commentSchema = mongoose.Schema(
  {
    feedback: {
      type: mongoose.Types.ObjectId,
      ref: "Feedback",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    subcomment: [subCommentSchema],

    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
