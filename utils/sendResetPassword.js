const sendEmail = require("./sendEmail");

const sendResetPassword = async ({ name, email, token, origin }) => {
  const resetUrl = `${origin}?token=${token}&email=${email}`;
  const message = `<p>Please reset your password by clicking on the reset password button : <a href="${resetUrl}">Reset Password</a></p>`;

  return sendEmail({
    to: email,
    subject: "Reset Password",
    html: `<h4>Hello, ${name}</h4> ${message}`,
  });
};

module.exports = sendResetPassword;
