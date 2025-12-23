import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Allow requests only from your frontend
const allowedOrigins = [
  "https://www.drsa.com",
  "https://elipsestudio.com",  // add more domains as needed
  
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["POST", "GET"],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/send-quote", async (req, res) => {
  const { name, email, confirmEmail, country, postcode, telephone, comments } = req.body;

  if (!name || !email || !confirmEmail || !country || !postcode || !telephone) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  if (email !== confirmEmail) {
    return res.status(400).json({ message: "Emails do not match" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'sales@drsa.com', // your receiving email
      subject: `New Quote Request from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Country: ${country}
        Postcode: ${postcode}
        Telephone: ${telephone}
        Comments: ${comments || "N/A"}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Quote request sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email", error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
