module.exports = function (firstname, otp) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Harpenin Account Password</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
          }
          .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 3px solid #eda326;
          }
          .logo {
              font-size: 32px;
              font-weight: bold;
              color: #eda326;
              text-decoration: none;
          }
          .content {
              padding: 30px 20px;
          }
          .verification-code {
              background-color: #f5f5f5;
              border: 1px solid #e0e0e0;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
              font-size: 24px;
              letter-spacing: 5px;
              font-weight: bold;
              color: #333333;
          }
          .button {
              display: block;
              width: 200px;
              margin: 30px auto;
              padding: 15px 0;
              background-color: #eda326;
              color: #ffffff;
              text-align: center;
              text-decoration: none;
              font-weight: bold;
              border-radius: 4px;
          }
          .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
              font-size: 12px;
              color: #666666;
          }
          .social-links {
              margin: 15px 0;
          }
          .social-link {
              margin: 0 10px;
              color: #eda326;
              text-decoration: none;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <span class="logo">harpenin</span>
          </div>
          <div class="content">
              <h2>Reset Your Password OTP</h2>
              <p>Hello ${firstname},</p>
              
              <div class="verification-code">${otp}</div>
              
              <p>This code will expire in 10 minutes for security reasons.</p>
              
              
              <p>If you didn't initiate this, you can safely ignore this email.</p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@harpenin.com" style="color: #eda326;">support@harpenin.com</a></p>
          </div>
          <div class="footer">
              <div class="social-links">
                  <a href="#" class="social-link">Facebook</a>
                  <a href="#" class="social-link">Twitter</a>
                  <a href="#" class="social-link">Instagram</a>
              </div>
              <p>&copy; 2025 Harpenin. All rights reserved.</p>
              <p>N0 50, Islamiyyah, ikire, Osun State, Nigeria</p>
          </div>
      </div>
  </body>
  </html>`;
};
