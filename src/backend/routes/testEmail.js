import express from 'express';
import { sendEmail } from '../utils/email.js';
import { baseTemplate } from '../templates/baseTemplate.js'; // 👈 import the template

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const html = baseTemplate({
      title: 'Your MVP is Ready 🎉',
      body: `
        <p>Hey Ujjwal,</p>
        <p>Your MVP is live and ready for review.</p>
        <p><a href="https://project.cofoundless.com" target="_blank">👉 View your MVP here</a></p>
        <p>Let us know if you'd like revisions or want to launch it today.</p>
      `
    });

    await sendEmail({
      to: 'ujj.code@gmail.com',
      subject: '🚀 Your MVP is Live!',
      html
    });

    res.json({ message: 'Email sent with HTML template' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
