const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authentication");

const {
  CreateFeedback,
  EditFeedback,
  UpVotes,
  GetAllFeedbacks,
  GetSingleFeedback,
  DeleteFeedback,
  // UpdateCommentFeedback,
  // DeleteCommentFeedback,
  // DeleteSubcomment,
  // CommentFeedback,
  // AddSubComment,
  // EditSubComment,
} = require("../controllers/feedbackController");

const {
  UpdateCommentFeedback,
  DeleteCommentFeedback,
  DeleteSubcomment,
  CommentFeedback,
  AddSubComment,
  EditSubComment,
} = require("../controllers/commentController");

router.get("/", GetAllFeedbacks);
router.post("/create-feedback", authenticateUser, CreateFeedback);
router.post("/create-comment", authenticateUser, CommentFeedback);
router.post("/create-subcomment", authenticateUser, AddSubComment);
router.patch("/update-comment", authenticateUser, UpdateCommentFeedback);
router.delete("/delete-comment", authenticateUser, DeleteCommentFeedback);
router.delete("/delete-subcomment", authenticateUser, DeleteSubcomment);
router.patch("/update-subcomment", authenticateUser, EditSubComment);
router.patch("/upvote", authenticateUser, UpVotes);
router
  .route("/:id")
  .get(GetSingleFeedback)
  .patch(authenticateUser, EditFeedback)
  .delete(authenticateUser, DeleteFeedback);

module.exports = router;
