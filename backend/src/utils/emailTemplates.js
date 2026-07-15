const wrapper = (title, inner) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:Segoe UI,Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;padding:36px;background:rgba(255,255,255,0.06);
              border:1px solid rgba(255,255,255,0.15);border-radius:18px;color:#e2e8f0;">
    <h1 style="margin:0 0 6px;font-size:22px;color:#ffffff;">${title}</h1>
    ${inner}
    <p style="margin-top:28px;font-size:12px;color:#94a3b8;">
      If you didn't request this email, you can safely ignore it.
    </p>
  </div>
</body>
</html>`;

function welcomeEmail(firstName) {
  return {
    subject: 'Welcome to Auth App 🎉',
    text: `Hi ${firstName}, your account has been created successfully. You can now log in.`,
    html: wrapper(
      `Welcome, ${firstName}! 🎉`,
      `<p style="line-height:1.6;">Your account has been created successfully.</p>
       <p style="line-height:1.6;">You can now log in and explore your dashboard. We're glad to have you.</p>`
    ),
  };
}

function otpEmail(firstName, otp, minutes) {
  return {
    subject: `Your password reset code: ${otp}`,
    text: `Hi ${firstName}, your password reset code is ${otp}. It expires in ${minutes} minutes.`,
    html: wrapper(
      'Password reset code',
      `<p style="line-height:1.6;">Hi ${firstName}, use this one-time code to reset your password:</p>
       <div style="font-size:34px;font-weight:800;letter-spacing:10px;text-align:center;
                   padding:18px;margin:14px 0;background:rgba(255,255,255,0.08);
                   border-radius:12px;color:#ffffff;">${otp}</div>
       <p style="line-height:1.6;">The code expires in <b>${minutes} minutes</b>.</p>`
    ),
  };
}

function passwordChangedEmail(firstName) {
  return {
    subject: 'Your password was changed',
    text: `Hi ${firstName}, your password was just changed. If this wasn't you, contact support immediately.`,
    html: wrapper(
      'Password changed',
      `<p style="line-height:1.6;">Hi ${firstName}, your password was just changed successfully.</p>
       <p style="line-height:1.6;">If this wasn't you, contact support immediately.</p>`
    ),
  };
}

module.exports = { welcomeEmail, otpEmail, passwordChangedEmail };
