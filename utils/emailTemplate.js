module.exports = (otp, name) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; background: #f4f4f7; padding: 0;">
  <div style="max-width: 500px; margin: auto; background: #fff; padding: 30px; border-radius: 10px;">
      
      <h2 style="text-align:center; color:#4b4bfc;">ITwale - Email Verification</h2>
      
      <p>Hi <strong>${name}</strong>,</p>
      <p>Use the OTP below to verify your email:</p>

      <h1 style="text-align:center; letter-spacing:5px; font-size:40px; color:#4b4bfc;">
        ${otp}
      </h1>

      <p style="text-align:center;">This OTP will expire in <strong>10 minutes</strong>.</p>
      
      <p>If you didn’t request this, please ignore this email.</p>
      
      <p style="margin-top:30px;">Regards,<br>Team ITwale</p>
  </div>
</body>
</html>`;
