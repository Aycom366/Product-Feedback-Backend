const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const Comment = require("../models/Comment");
const Upvote = require("../models/UpVote");
const { checkPermission } = require("../utils");

const CreateFeedback = async (req, res) => {
  const { feedbackTitle, feedbackCategory, feedbackDetails } = req.body;
  req.body.user = req.user.userId;

  if (!feedbackCategory || !feedbackTitle || !feedbackDetails) {
    throw new CustomError.BadRequestError("Please provide all the fields");
  }

  const feedback = await Feedback.create(req.body);
  let fullFeedback = await Feedback.findOne({ _id: feedback._id })
    .populate("user", "_id name pic email")
    .populate({
      path: "comment",
      populate: { path: "sender", model: "User", select: "_id name pic email" },
      populate: [
        {
          path: "subcomment",
          populate: {
            path: "sender owner",
            model: "User",
            select: "_id name pic email",
          },
        },
      ],
    })
    .populate({ path: "upvote", select: "_id feedback user" });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Feedback created successfully", fullFeedback });
};

const GetAllFeedbacks = async (req, res) => {
  const feedbacks = await Feedback.find({})
    .populate("user", "_id name pic email")
    .populate({
      path: "comment",
      populate: {
        path: "sender",
        model: "User",
        select: "_id name pic email",
      },
    })
    .populate({ path: "upvote", select: "_id feedback user" })
    .populate({
      path: "comment",
      populate: [
        {
          path: "subcomment",
          populate: {
            path: "sender owner",
            model: "User",
            select: "_id name pic email",
          },
        },
      ],
    });

  res.status(StatusCodes.OK).json({ msg: "success", data: feedbacks });
};

const GetSingleFeedback = async (req, res) => {
  const { id: feedbackId } = req.params;
  if (!feedbackId) {
    throw new CustomError.BadRequestError("feedback Id is required");
  }
  const feedback = await Feedback.findById(feedbackId)
    .populate("user", "_id name pic email")
    .populate({
      path: "comment",
      populate: {
        path: "sender",
        model: "User",
        select: "_id name pic email",
      },
    })
    .populate({ path: "upvote", select: "_id feedback user" })
    .populate({
      path: "comment",
      populate: [
        {
          path: "subcomment",
          populate: {
            path: "sender owner",
            model: "User",
            select: "_id name pic email",
          },
        },
      ],
    });

  if (!feedback) {
    throw new CustomError.NotFoundError("Feedback doesn't exist");
  }
  res.status(StatusCodes.OK).json({ msg: "success", data: feedback });
};

const DeleteFeedback = async (req, res) => {
  const { id: feedbackId } = req.params;
  const feedback = await Feedback.findOne({ _id: feedbackId });
  if (!feedback) {
    throw new CustomError.NotFoundError(
      `No ${id} is associated with this feedback`
    );
  }
  checkPermission(req.user.userId, feedback.user);
  //some things are dbeen done in the feedback model which resulted ot useing feedback.remnove();
  await feedback.remove();
  res.status(StatusCodes.OK).json({ msg: "success!", data: [] });
};

const EditFeedback = async (req, res) => {
  const { feedbackTitle, feedbackCategory, feedbackDetails, feedbackStatus } =
    req.body;

  const { id: feedbackId } = req.params;

  if (
    !feedbackTitle ||
    !feedbackCategory ||
    !feedbackDetails ||
    !feedbackStatus
  ) {
    throw new CustomError.BadRequestError("All fields are required!");
  }

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    throw new CustomError.NotFoundError(`${feedbackId} does not exist`);
  }
  checkPermission(req.user.userId, feedback.user);

  feedback.feedbackTitle = feedbackTitle;
  feedback.feedbackDetails = feedbackDetails;
  feedback.feedbackStatus = feedbackStatus;
  feedback.feedbackCategory = feedbackCategory;
  await feedback.save();

  const fullFeedback = await Feedback.findOne({ _id: feedbackId })
    .populate("user", "_id name pic email")
    .populate({
      path: "comment",
      populate: {
        path: "sender",
        model: "User",
        select: "_id name pic email",
      },
    })
    .populate({ path: "upvote", select: "_id feedback user" })
    .populate({
      path: "comment",
      populate: [
        {
          path: "subcomment",
          populate: {
            path: "sender owner",
            model: "User",
            select: "_id name pic email",
          },
        },
      ],
    });

  res
    .status(StatusCodes.OK)
    .json({ msg: "Feedback updated", data: fullFeedback });
};

const UpVotes = async (req, res) => {
  const { userId, feedbackId } = req.body;
  if (!userId || !feedbackId) {
    throw new CustomError.BadRequestError("All fields are required!");
  }

  const doesUserExist = await User.findOne({ _id: userId });
  if (!doesUserExist) {
    throw new CustomError.NotFoundError(`user with ${userId} not found`);
  }

  //does feedback itself exist
  const checkFeedback = await Feedback.findOne({ _id: feedbackId });

  if (!checkFeedback) {
    throw new CustomError.NotFoundError(
      `Feedback with Id:${feedbackId} does not found`
    );
  }

  //check whether feedbackId exist on upvote before or not
  const upVote = await Upvote.findOne({ feedback: feedbackId });
  if (!upVote) {
    const upvote = await Upvote.create({
      user: userId,
      feedback: feedbackId,
    });
    res.status(StatusCodes.CREATED).json(upvote);
    return;
  }

  const checkUser = await Upvote.findOne({
    feedback: feedbackId,
    user: { $eq: userId },
  });
  console.log(checkUser);

  //if user exists, then remove from array
  if (checkUser) {
    const addUpvote = await Upvote.findOneAndUpdate(
      { feedback: feedbackId },
      { $pull: { user: userId } },
      { new: true }
    ).populate("feedback", "_id");
    res.status(StatusCodes.OK).json(addUpvote);
  }
  //else add to array
  else {
    const addUpvote = await Upvote.findOneAndUpdate(
      { feedback: feedbackId },
      { $push: { user: userId } },
      { new: true }
    ).populate("feedback", "_id");
    res.status(StatusCodes.OK).json(addUpvote);
  }
};

module.exports = {
  CreateFeedback,
  EditFeedback,
  UpVotes,
  // EditSubComment,
  // DeleteSubcomment,
  // UpdateCommentFeedback,
  // CommentFeedback,
  // AddSubComment,
  // DeleteCommentFeedback,

  GetAllFeedbacks,
  GetSingleFeedback,
  DeleteFeedback,
};
