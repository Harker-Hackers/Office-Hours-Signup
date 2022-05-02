import { Transporter,createTransport } from "nodemailer";
import { Email } from "../types";
const cfg=require("../config.json")

export class BaseEmailHandler{
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
    async sendEmail(e:Email){
        return await this.transporter.sendMail(e);
    }
}
export class StudentEmailHandler extends BaseEmailHandler{
    async cancelSlot(e:string,tn:string,d:string,st:string,et:string){
        let sd = new Date(d+"T"+st),ed=new Date(d+"T"+et),dn=sd.toLocaleString("en-us",{weekday:'long',
        month:'long',day:'numeric'}),sn=sd.toLocaleTimeString("en-us",{hour:"numeric",minute:"numeric"}),en=
        ed.toLocaleTimeString("en-us",{hour:"numeric",minute:"numeric"})
        let t=`Your meeting with ${tn} on ${dn} from ${sn} to ${en} has been cancelled.`
        let h=`<p style='font-size:2em;'>Your meeting with <b style='color:rgb(110,200,40);'>${tn}</b> on <b style='color:rgb(40, 200, 110);'>${dn}</b> from <b style='color:rgb(80,80,140)'>${sn}</b> to <b style='color:rgb(80,80,140)'>${en}</b> has been cancelled.</p>`
        this.sendEmail({from:cfg.emailName,to:e,subject:"Slot Cancelled",text:t,html:h})
    }
}
export const studentEmailHandler=new StudentEmailHandler();