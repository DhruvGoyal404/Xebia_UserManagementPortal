const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendApprovalEmail = async ({ to, username }) => {
  const loginUrl = 'https://xebia.dhruvgoyal.tech/login';

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #18181b; line-height: 1.6;">
      <p>Hi <strong>${username}</strong>,</p>
      <p>Your registration on <strong>UserPortal</strong> has been approved by an admin.</p>
      <p>You can now log in using your email and password:</p>
      <p><a href="${loginUrl}" style="color: #4f46e5;">${loginUrl}</a></p>
      <p>Welcome aboard.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">— UserPortal Team</p>
    </div>
  `;

  const text = `Hi ${username},

Your registration on UserPortal has been approved by an admin.
You can now log in: ${loginUrl}

Welcome aboard.
— UserPortal Team`;

  return transporter.sendMail({
    from: `"UserPortal" <${process.env.MAIL}>`,
    to,
    subject: 'Your UserPortal registration is approved',
    text,
    html,
  });
};

module.exports = { sendApprovalEmail };
