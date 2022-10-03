import { Transporter, createTransport } from "nodemailer";
import { Email } from "../types";
import { renderFile } from "ejs";
const cfg = require("../config.json");

export class BaseEmailHandler {
    transporter: Transporter;
    constructor() {
        this.transporter = createTransport({
            port: 465,
            host: "smtp.gmail.com",
            auth: {
                user: cfg.emailName,
                pass: cfg.emailPass,
            },
            secure: true,
        });
    }
    async sendEmail(e: Email) {
        return await this.transporter.sendMail(e);
    }
}

export class StudentEmailHandler extends BaseEmailHandler {
    private static parseTime(time: string): string {
        let hours = parseInt(time.substring(0, 2));
        let newHours = (hours + 11) % 12 + 1;
        var suffix = hours >= 12 ? "PM" : "AM"; 
        return `${Number(newHours).toString() + time.substring(time.length - 6, time.length - 3)} ${suffix}`;
    }

    async cancelSlot(student_email: string, name: string, date: string, startTime: string, endTime: string, reason?: string) {
        startTime = StudentEmailHandler.parseTime(startTime);
        endTime = StudentEmailHandler.parseTime(endTime);
        renderFile(
            "emails/student/cancellation.ejs",
            { name: name, date: date, startTime: startTime, endTime: endTime, reason: reason },
            (err, emailBody) => {
                console.log(err);
                let sd = new Date(date + "T" + startTime),
                    ed = new Date(date + "T" + endTime),
                    dn = sd.toLocaleString("en-us", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                    }),
                    sn = sd.toLocaleTimeString("en-us", {
                        hour: "numeric",
                        minute: "numeric",
                    }),
                    en = ed.toLocaleTimeString("en-us", {
                        hour: "numeric",
                        minute: "numeric",
                    });
                this.sendEmail({
                    from: cfg.emailName,
                    to: student_email,
                    subject: `Meeting with ${name} Cancelled`,
                    text: `Your meeting with ${name} on ${dn} from ${sn} to ${en} has been cancelled.`,
                    html: emailBody,
                });
            }
        );
    }
}
export const studentEmailHandler = new StudentEmailHandler();
