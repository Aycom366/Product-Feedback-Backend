require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

//database imports
const connectDb = require("./db/connectDb");

//third library imports
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

//routes imports
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const feedbackRoute = require("./routes/feedbackRoute");

const errorHandlerMiddleware = require("./middlewares/error-handler");
const NotFound = require("./middlewares/NotFound");

//middlewares
app.use(express.static("./public"));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(fileUpload());
app.use(morgan("dev"));
app.use(mongoSanitize());
app.use(cookieParser(process.env.JWT_SECRET));

//routes
app.use("/", (req, res) => {
  res.json({ msg: "hello world" });
});
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/feedback", feedbackRoute);

app.use(NotFound);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URL);
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`server started on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
