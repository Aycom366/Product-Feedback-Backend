const mongoose = require("mongoose");
const Upvote = require("./UpVote");

const FeedbackSchema = mongoose.Schema(
  {
    feedbackTitle: {
      type: String,
      required: [true, "Feedback Title is required!"],
    },
    feedbackCategory: {
      type: String,
      default: "Feature",
      enum: {
        values: ["Feature", "UI", "UX", "Enchancement", "Bug"],
        message: "{VALUE} is not supported",
      },
    },
    feedbackDetails: {
      type: String,
      required: [true, "Feedback Details is required!"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feedbackStatus: {
      type: String,
      default: "Planned",
      enum: {
        values: ["Planned", "Suggestion", "Live", "In-Progress"],
      },
    },
  },

  //setting up virtual to accept virtuals
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//populating our products with comments and the rest
FeedbackSchema.virtual("comment", {
  ref: "Comment",
  localField: "_id",
  foreignField: "feedback",
  justOne: false,
});

FeedbackSchema.virtual("upvote", {
  ref: "UpVote",
  localField: "_id",
  foreignField: "feedback",
  justOne: false,
});

FeedbackSchema.pre("remove", async function () {
  await this.model("Comment").deleteMany({ feedback: this._id });
  await this.model("UpVote").deleteMany({ feedback: this._id });
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
