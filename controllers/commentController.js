const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const Comment = require("../models/Comment");
const { checkPermission } = require("../utils");

const CommentFeedback = async (req, res) => {
  const { feedbackId, content, senderId } = req.body;
  if (!feedbackId || !content || !senderId) {
    throw new CustomError.BadRequestError("All fields are required!");
  }

  const checkFeedback = await Feedback.findOne({ _id: feedbackId });
  if (!checkFeedback) {
    throw new CustomError.NotFoundError("FeedbackId does not exist");
  }

  const comment = await Comment.create({
    feedback: feedbackId,
    content,
    sender: senderId,
  });

  const fullCommet = await Comment.find({ _id: comment._id })
    .populate("sender", "_id name pic email")
    .populate("subcomment.sender");

  res.status(StatusCodes.OK).json(fullCommet);
};

const UpdateCommentFeedback = async (req, res) => {
  const { commentId, content } = req.body;
  if (!commentId || !content) {
    throw new CustomError.BadRequestError("All fields are required!");
  }

  const comment = await Comment.findOne({ _id: commentId });
  if (!comment) {
    throw new CustomError.NotFoundError("comment Id not valid!");
  }

  checkPermission(req.user.userId, comment.sender);
  comment.content = content;
  await comment.save();

  const fullCommet = await Comment.find({ _id: comment._id })
    .populate("sender", "_id name pic email")
    .populate("subcomment.sender", "_id name pic email")
    .populate("subcomment.owner", "_id name pic email");

  res.status(StatusCodes.OK).json(fullCommet);
};

const DeleteCommentFeedback = async (req, res) => {
  const { commentId } = req.body;

  const comment = await Comment.findOne({ _id: commentId });
  if (!comment) {
    throw new CustomError.NotFoundError("comment Id not valid!");
  }
  checkPermission(req.user.userId, comment.sender);
  await comment.remove();
  res.status(StatusCodes.OK).json({ msg: "Comment deleted successfully" });
};

const AddSubComment = async (req, res) => {
  const { commentId, content, senderId, replyingToId } = req.body;
  if ((!content, commentId, !senderId, !replyingToId)) {
    throw new CustomError.BadRequestError("All fields are required");
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId },
    {
      $push: { subcomment: { content, sender: senderId, owner: replyingToId } },
    },
    { new: true }
  );

  if (comment) {
    const fullCommet = await Comment.find({ _id: comment._id })
      .populate("sender", "_id name pic email")
      .populate("subcomment.sender", "_id name pic email")
      .populate("subcomment.owner", "_id name pic email");
    res.status(StatusCodes.OK).json(fullCommet);
  }
  throw new CustomError.NotFoundError(
    `comment with Id:${commentId} passed does not exist`
  );
};

const EditSubComment = async (req, res) => {
  const { commentId, subCommentId, content } = req.body;
  if ((!subCommentId || !commentId, !content)) {
    throw new CustomError.BadRequestError("All fields are required");
  }

  try {
    await Comment.updateOne(
      {
        _id: commentId,
      },
      { $set: { "subcomment.$[elem].content": content } },
      {
        arrayFilters: [
          { "elem._id": subCommentId, "elem.sender": req.user.userId },
        ],
      }
    );

    const fullCommet = await Comment.find({ _id: commentId })
      .populate("sender", "_id name pic email")
      .populate("subcomment.sender", "_id name pic email")
      .populate("subcomment.owner", "_id name pic email");
    res.status(StatusCodes.OK).res.json(fullCommet);
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
};

const DeleteSubcomment = async (req, res) => {
  const { commentId, feedbackId, subCommentId } = req.body;
  if (!subCommentId || !commentId) {
    throw new CustomError.BadRequestError("All fields are required");
  }

  try {
    await Comment.updateOne(
      {
        _id: commentId,
      },
      {
        $pull: { subcomment: { _id: subCommentId, sender: req.user.userId } },
      }
    );
    const fullComment = await Comment.find({ feedback: feedbackId })
      .populate("sender", "_id name pic email")
      .populate("subcomment.sender", "_id name pic email")
      .populate("subcomment.owner", "_id name pic email");
    res.status(StatusCodes.OK).json({ msg: "success", data: fullComment });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
};

module.exports = {
  EditSubComment,
  DeleteSubcomment,
  UpdateCommentFeedback,
  CommentFeedback,
  AddSubComment,
  DeleteCommentFeedback,
};
