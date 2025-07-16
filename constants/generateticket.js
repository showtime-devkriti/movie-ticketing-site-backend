const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
function generateTicket(data, outputPath) {
  const {
    title,
    language,
    format,
    theatretitle,
    location,
    starttime,
    seats,
    quantity,
    ticketPrice,
    convenienceFee,
    totalAmount
  } = data;
   const doc = new PDFDocument();
     doc.pipe(fs.createWriteStream(outputPath));

     doc
    .fontSize(20)
    .text(`${title} (${language}) - ${format}`, { align: "center" })
    .moveDown(0.5);
     doc
    .fontSize(14)
    .text(`Date & Time: ${new Date(starttime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`)
    .text(`Theatre: ${theatretitle}`)
    .text(`Location: ${location}`)
    .moveDown(0.5);
    doc
    .fontSize(14)
    .text(`Seats: ${seats.join(", ")}`)
    .text(`Quantity: ${quantity}`)
    .moveDown(0.5);
    doc
    .fontSize(14)
    .text(`Ticket Price: ₹${ticketPrice}`)
    .text(`Convenience Fee: ₹${convenienceFee}`)
    .moveDown(0.5);
    doc
    .fontSize(16)
    .fillColor("green")
    .text(`Total Paid: ₹${totalAmount}`, { underline: true })
    doc.end();

}
module.exports=generateTicket