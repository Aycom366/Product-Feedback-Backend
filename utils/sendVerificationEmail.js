const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  //construct the verification link
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the verify email button : <a href=${verifyEmail}>Verify Email</a></p>`;

  return sendEmail({
    to: email,
    subject: "Verify your email",
    html: `<h4>Hello, ${name}</h4> ${message}`,
  });
};

module.exports = sendVerificationEmail;
