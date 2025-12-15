const nodemailer = require("nodemailer");
const emailTemplate = require("./emailTemplate");

const sendOtp = async (email, otp, name) => {
  try {
    const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,  // 16-digit app password
  },
});


    await transporter.sendMail({
      from: `"ITwale" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your OTP - ITwale",
      html: emailTemplate(otp, name),
    });

    console.log("Email sent successfully to:", email);

  } catch (err) {
    console.error("Nodemailer Error:", err);
    throw err; // ye error controller me chala jayega
  }
};

module.exports = sendOtp;
