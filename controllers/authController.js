const User = require("../models/User");
const CustomError = require("../errors");
const Token = require("../models/Token");
const Crypto = require("crypto");

//this package will be used to verify the google tokenId received from the client side

const { OAuth2Client } = require("google-auth-library");

const {
  sendVerificationEmail,
  createTokenUser,
  sendResetPassword,
  attachCookiesToBrowser,
  Origin,
} = require("../utils");

const { StatusCodes } = require("http-status-codes");

//initialize the google client to verify the client side token with our google client id
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const GoogleLogin = async (req, res) => {
  const { tokenId } = req.body;

  //get the users data from the google clients
  try {
    const { payload } = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, email, given_name, picture } = payload;

    if (!email_verified) {
      throw new CustomError.BadRequestError("Please verify your email");
    }

    //if user tries to login with google, then check if the user is already registered
    const user = await User.findOne({ email });
    let refreshToken = "";
    if (user) {
      //if user is registered, then check if the user has a refresh token
      const existingRefreshToken = await Token.findOne({ user: user._id });
      const token = createTokenUser(user);
      if (existingRefreshToken) {
        //if refresh token as exists
        refreshToken = existingRefreshToken;

        attachCookiesToBrowser({ res, user: token, refreshToken });
        res.status(200).json({ msg: "Login Successful", data: token });
        return;
      }

      //if refresh token is not present before, then re-create it
      refreshToken = Crypto.randomBytes(40).toString("hex");
      const userAgent = req.headers["user-agent"];
      const ip = req.ip;

      await Token.create({ refreshToken, ip, userAgent, user: user._id });

      attachCookiesToBrowser({ res, user: token, refreshToken });
      res.status(StatusCodes.OK).json({ msg: "Login Successful", data: token });
      return;
    }

    //if hasn't been created, then create the user
    //create a fakePassword
    let password = email + process.env.GMAIL_USER;
    const newUser = await User.create({
      name: given_name,
      email,
      password,
      isVerified: true,
      isGoogle: true,
      verified: new Date(Date.now()),
      pic: picture,
    });

    //create a token
    const token = createTokenUser(newUser);

    //create refresh token
    refreshToken = Crypto.randomBytes(40).toString("hex");
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    await Token.create({ refreshToken, ip, userAgent, user: newUser._id });

    attachCookiesToBrowser({ res, user: token, refreshToken });

    res.status(StatusCodes.OK).json({ msg: "Login Successful", data: token });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;

  //email and password empty?
  if (!email || !password) {
    throw new CustomError.BadRequestError(
      "Please provide all the required fields"
    );
  }

  //does email exist
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.Unauthenticated("Invalid Credentials");
  }

  //compare the password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new CustomError.Unauthenticated("Invalid Credentials");
  }

  //has user been verifed
  if (!user.isVerified) {
    throw new CustomError.Unauthenticated("Please verify your email");
  }

  //generate a token that wee be hashed that will contain user's information
  const token = createTokenUser(user);

  //create a crypto hash
  let refreshToken = "";

  //if refresh token for user is present before
  const existingRefreshToken = await Token.findOne({ user: user._id });

  if (existingRefreshToken) {
    //if refrsh token as expired
    refreshToken = existingRefreshToken;

    attachCookiesToBrowser({ res, user: token, refreshToken });

    res.status(StatusCodes.OK).json({ msg: "Login Successful", data: token });
    return;
  }

  //if refresh token is not present before, then re-create it
  refreshToken = Crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  await Token.create({ refreshToken, ip, userAgent, user: user._id });

  attachCookiesToBrowser({ res, user: token, refreshToken });

  res.status(StatusCodes.OK).json({ msg: "Login Successful", data: token });
};

const Register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new CustomError.BadRequestError(
      "Please provide all the required fields"
    );
  }

  let isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    throw new CustomError.BadRequestError("Email already exist");
  }

  if (isEmailExist && isEmailExist.isGoogle) {
    throw new CustomError.BadRequestError("Email registered with google");
  }

  //create a verification token with the Crypto library
  const verificationToken = Crypto.randomBytes(40).toString("hex");

  //where request is coming from
  const origin = Origin(req.get("origin"));

  const user = await User.create({
    name,
    email,
    password,
    isGoogle: false,
    verificationToken,
    pic: req.pic,
  });

  //send the verification email
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Please check your email to verify your account" });
};

const VerifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;

  //does email exist
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.BadRequestError("User does not exist");
  }

  //if verifcation matches with the verifcation token
  if (user.verificationToken !== verificationToken) {
    throw new CustomError.BadRequestError("Verification token is invalid");
  }

  //update the user
  user.isVerified = true;
  user.verificationToken = null;
  user.verified = new Date();

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Email verified successfully" });
};

const ForgotPassowrd = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Please provide your email");
  }

  //check to see if email exist
  const user = await User.findOne({ email });
  if (user) {
    //check if user disigned up with google
    if (user.isGoogle) {
      throw new CustomError.BadRequestError(
        "Please use google to reset your password"
      );
    }

    const passwordToken = Crypto.randomBytes(40).toString("hex");

    const origin = Origin(req.get("origin"));

    await sendResetPassword({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    //set expiration for the resetToken
    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;

    await user.save();
  }
  res.status(StatusCodes.OK).json({ msg: "Please check your email" });
};

const ResetPassword = async (req, res) => {
  //user's email, new password and passwordToken
  const { email, password, passwordToken } = req.body;

  if (!email || !password || !passwordToken) {
    throw new CustomError.BadRequestError(
      "Please provide all the required fields"
    );
  }

  //does user exists
  const user = await User.findOne({ email });
  if (user) {
    //check if user disigned up with google
    if (user.isGoogle) {
      throw new CustomError.BadRequestError(
        "Please use google to reset your password"
      );
    }

    const currentDate = new Date();

    if (
      user.passwordTokenExpirationDate > currentDate &&
      passwordToken === user.passwordToken
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;

      await user.save();
    }
  }
  res.status(StatusCodes.OK).json({ msg: "Password reset successfully" });
};

const Logout = async (req, res) => {
  //delete the token associated with this user
  await Token.findOneAndDelete({ user: req.user.userId });

  //set the cookie to expire
  //second parameter not really needed
  res.cookie("refreshToken", "", { expires: new Date(Date.now()) });

  res.cookie("accessToken", "", { expires: new Date(Date.now()) });

  res.status(StatusCodes.OK).json({ msg: "Logout Successful" });
};

module.exports = {
  Register,
  VerifyEmail,
  Login,
  ForgotPassowrd,
  ResetPassword,
  Logout,
  GoogleLogin,
};
