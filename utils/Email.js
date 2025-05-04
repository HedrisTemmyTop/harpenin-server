const nodemailer = require("nodemailer");
const catchAsync = require("./catchAsync");

const verify = require("../templates/verify");
const reset = require("./../templates/reset");

// const sendEmail = catchAsync(async (options) => {
//   // Create a transporter
//   console.log(process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD);

//   // Define the email options
//   const mailOptions = {
//     from: 'Hedris TemmyTop <hedristemitope2001@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,

//     // html:
//   };
//   // Send the email with nodemailer

//   await transporter.sendMail(mailOptions);
// });

// module.exports = sendEmail;

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.firstname;

    this.from = `Hedris TemmyTop <T>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Create a Nodemailer transporter using Gmail's SMTP server
      return nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "hedristemitope2001@gmail.com", // Your Gmail email address
          pass: "ikfk ghyw fqyt apvr", // App Password (or your Gmail account password)
        },
        tls: {
          rejectUnauthorized: false, // Trust self-signed certificates
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      // secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },

      // Activate less secure app on your gmail account
    });
  }

  async send(template, subject) {
    // render the html based on pug template

    // define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,

      // text: htmlToText.fromString(html),
    };

    // create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendReset(otp) {
    const html = reset(this.firstname, otp);
    await this.send(html, "Reset Your Password");
  }

  async sendVerify(otp) {
    const html = verify(this.firstname, otp);
    await this.send(html, "Verify Your Email");
  }
};
