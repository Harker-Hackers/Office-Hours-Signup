import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export class UpdateHandler{
    sockets:Map<String,Map<String,Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>>;
    constructor(){
        this.sockets=new Map();
    }
    generateUID(email:string,teacher:boolean)
    {
        return (teacher?"teacher-":"student-")+email;
    }
    addSocket(s:Socket,uid:string){
        let z=this.sockets.get(uid);
        z?z.set(s.id,s):(this.sockets.set(uid,new Map()),this.sockets.get(uid)?.set(s.id,s));
        return uid;
    }
    removeSocket(uid:string,sid:string){
        let z=this.sockets.get(uid);
        if(z){let b=z.delete(sid);(z.size==0)&&(this.sockets.delete(uid));return b;}
        return false;
    }
    updateSocket(uid:string,type?:string,msg?:object){
        let z=this.sockets.get(uid);
        z&&z.forEach((v,k)=>{v.emit(type||"update",msg||{})})
    }
}
export default new UpdateHandler();