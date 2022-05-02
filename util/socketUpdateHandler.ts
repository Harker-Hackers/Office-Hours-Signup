import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export class UpdateHandler{
    sockets:Map<String,Map<String,Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>>;
    student_focus:Map<String,Map<String,Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>>;
    reverse_student_focus:Map<String,String>;

    constructor(){
        this.sockets=new Map();
        this.student_focus=new Map();
        this.reverse_student_focus=new Map();
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
        this.unfocusStudent(sid);
        if(z){let b=z.delete(sid);(z.size==0)&&this.sockets.delete(uid);return b;}
        return false;
    }
    updateSocket(uid:string,type?:string,msg?:object){
        let z=this.sockets.get(uid);
        z&&z.forEach((v,k)=>{v.emit(type||"update",msg||{})})
    }
    updateFocus(teacher_id:string,type?:string,msg?:object){
        let z = this.student_focus.get(teacher_id);
        z&&z.forEach((v,k)=>{
            v.emit(type||"update",msg||{});
        })
    }
    unfocusStudent(sid:string){
        let tid=this.reverse_student_focus.get(sid);
        this.reverse_student_focus.delete(sid);
        tid&&(this.student_focus.get(tid)?.delete(sid),
        this.student_focus.get(tid)?.size==0&&this.student_focus.delete(tid));
    }
    focusStudent(socket:Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,teacher_id:string){
        this.unfocusStudent(socket.id);
        let r=this.student_focus.get(teacher_id);
        r||this.student_focus.set(teacher_id,new Map());
        this.student_focus.get(teacher_id)?.set(socket.id,socket);
        this.reverse_student_focus.set(socket.id,teacher_id);
    }
}
export default new UpdateHandler();