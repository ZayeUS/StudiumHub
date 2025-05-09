export const baseTemplate = ({ title = '', body = '', footer = '' }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <style>
        body {
          font-family: 'Helvetica Neue', sans-serif;
          background-color: #f4f4f4;
          padding: 40px 20px;
          color: #0f172a;
        }
        .email-container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .body {
          font-size: 16px;
          line-height: 1.6;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #64748b;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="logo">
          <img src="/Users/ujjwal/Projects/SoftwareTemplate/public/vite.svg" alt="Cofoundless" width="120" />
        </div>
        <div class="title">${title}</div>
        <div class="body">${body}</div>
        <div class="footer">${footer || "© Cofoundless • MVPs in 24 hours"}</div>
      </div>
    </body>
  </html>
`;
