const mongoose = require("mongoose");
const UpVoteSchema = mongoose.Schema({
  user: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  feedback: {
    type: mongoose.Types.ObjectId,
    ref: "Feedback",
  },
});
module.exports = mongoose.model("UpVote", UpVoteSchema);
