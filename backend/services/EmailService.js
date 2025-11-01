import { env } from "../core/conf";
import nodemailer from "nodemailer";

// TODO: need to define workers for this
class EmailService {
  static instance;
  constructor() {
    if (EmailService.instance) {
      return EmailService.instance;
    }
    this.transporter = nodemailer.createTransport({
      host: env.getemailhost(),
      port: env.getemailPort(),
      secure: false,
      auth: {
        user: env.getEmail(),
        pass: env.getEmailpass(),
      },
    });

    EmailService.instance = this;
  }

  async SendEmail(to, subject, template) {
    try {
      return await this.transporter.sendMail({
        from: env.getEmail(),
        to: to,
        subject: subject,
        html: template,
      });
    } catch (error) {
      console.log("Error sending email:", error);
      throw error;
    }
  }
}

export default new EmailService();
