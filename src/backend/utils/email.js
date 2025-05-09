import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, html, from }) => {
  try {
    const msg = {
      to,
      from: {
        email: from || process.env.FROM_EMAIL,
        name: 'Cofoundless',
      },
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email send failed:', err.response?.body || err.message);
    throw new Error('Email failed');
  }
};
