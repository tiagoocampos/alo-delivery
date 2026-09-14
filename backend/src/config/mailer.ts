import axios from "axios";
import "dotenv/config";

interface SendEmailParams {
    to: string;
    subject: string;
    htmlContent: string;
}

// Railway Hobby bloqueia SMTP de saída (portas 25/465/587/2525) — só a API
// HTTPS do Brevo funciona sem precisar do plano Pro.
export async function sendEmail({ to, subject, htmlContent }: SendEmailParams) {
    await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
            sender: {
                email: process.env.EMAIL_FROM_ADDRESS,
                name: "Alô Delivery"
            },
            to: [{ email: to }],
            subject,
            htmlContent
        },
        {
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json"
            }
        }
    );
}
