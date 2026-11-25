require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function runTest() {
  try {
    await transporter.verify();
    console.log('SMTP connection verified.');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Nodemailer Test',
      text: 'If you received this, Nodemailer is working.'
    });

    console.log('Test email sent:', info.response);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

runTest();