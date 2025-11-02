import { env } from "../core/conf.js";
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
      const mail = await this.transporter.sendMail({
        from: env.getEmail(),
        to: to,
        subject: subject,
        html: template,
      });
      console.log(nodemailer.getTestMessageUrl(mail));
      return mail;
    } catch (error) {
      console.log("Error sending email:", error);
      throw error;
    }
  }
}

export default new EmailService();
