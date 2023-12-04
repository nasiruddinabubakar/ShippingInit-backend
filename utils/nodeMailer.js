const nodemailer = require("nodemailer");
const html = require('./template');
const invoice = require("./invoice");


async function sendMail(clientEmail) {
  // Create a nodemailer transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nasiruddinabubakar@gmail.com", // Your Gmail address
      pass: "powukutzvgkskldn", // Your Gmail password or an App Password if you have 2-Step Verification enabled
    },
  });

  // Define the email options
  const mailOptions = {
    from: "nasiruddinabubakar@gmail.com", // Sender's email address
    to: clientEmail, // Recipient's email address
    subject: "Order Confirmation", // Email subject
    html: html, // HTML content of the email
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Call the main function
module.exports = sendMail;
