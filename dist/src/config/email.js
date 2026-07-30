import nodemailer from "nodemailer";
import env from "./env.js";
const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});
export const sendEmail = async (to, subject, html) => {
    await transport.sendMail({
        from: `"CareerForge BD" <${env.SMTP_USER}>`,
        to,
        subject,
        html,
    });
};
//# sourceMappingURL=email.js.map