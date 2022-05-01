import { Server } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { getuserFromJWT } from "../util/authorizationHandler";
import updateHandler from "../util/socketUpdateHandler";

export default (io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>)=>{
    const nsp=io.of("/update");
    nsp.on("connection",function(socket){
        socket.on("auth", async function(msg){
            let u=await getuserFromJWT(msg);
            if(!u){socket.disconnect();return;}
            let uid=updateHandler.generateUID(u.teacher?u._id:u.email,u.teacher);
            updateHandler.addSocket(socket,uid);
            socket.on("disconnect",function(){
                updateHandler.removeSocket(uid,socket.id);
            })
        })
    })
}