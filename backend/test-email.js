
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: "kapilyadav.dev32@gmail.com", pass: "mnqnkulcamwtofjv" }
});
transporter.verify().then(() => console.log("Success")).catch(e => { console.error("Error:", e.message); process.exit(1); });

