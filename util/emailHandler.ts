import { Transporter,createTransport } from "nodemailer";
const cfg=require("../config.json")

export class EmailHandler{
    transporter:Transporter;
    constructor(){
        this.transporter=createTransport({
            port: 465,               // true for 465, false for other ports
            host: "smtp.gmail.com",
               auth: {
                    user: cfg.emailName,
                    pass: cfg.emailPass,
                 },
            secure: true,
        });
    }
}