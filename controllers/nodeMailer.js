const nodemailer = require("nodemailer");

const html = `
  <h1>Hello world</h1>
  <p1>Isn't NodeMailer awesome?</p>
`;

async function main() {
  // Create a nodemailer transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nasiruddinabubakar47@gmail.com", // Your Gmail address
      pass: "kingkhan456", // Your Gmail password or an App Password if you have 2-Step Verification enabled
    },
  });

  // Define the email options
  const mailOptions = {
    from: "nasiruddinabubakar47@gmail.com", // Sender's email address
    to: "nasiruddinabubakar@gmail.com", // Recipient's email address
    subject: "Test Email", // Email subject
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
module.exports = main;
