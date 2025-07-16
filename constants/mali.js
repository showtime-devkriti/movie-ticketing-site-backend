const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // MUST come before anything else


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,    
    pass: process.env.MAIL_PASS      
  }
});
const sendTicket = async ({ to, bookingId }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const ticketPath = path.join(__dirname, `../tickets/ticket-${bookingId}.pdf`);

  if (!fs.existsSync(ticketPath)) {
    throw new Error("Ticket file not found");
  }

  const mailOptions = {
    from: `"BookMyTicket" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🎟️ Your Movie Ticket Confirmation",
    text: "Attached is your confirmed movie ticket.",
    html: `<p>Dear User,<br>Your ticket has been successfully booked. Please find the attached PDF ticket.<br><br>Thank you for using our service!</p>`,
    attachments: [
      {
        filename: `ticket-${bookingId}.pdf`,
        path: ticketPath
      }
    ]
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {transporter,sendTicket };
