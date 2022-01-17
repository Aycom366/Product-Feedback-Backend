const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authentication");
const { ShowCurrentUser } = require("../controllers/userController");

router.route("/show-current-user").get(authenticateUser, ShowCurrentUser);

module.exports = router;
