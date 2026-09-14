import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT),
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
    }
});

export default transporter;
