import express from "express";
import http from "http";
import * as routes from "./routes";
import { Server } from "socket.io";
import setup from "./setup"

(global as any).base = __dirname;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(require("cookie-parser")());

app.use("/static", express.static(__dirname + "/static"));
app.use("/", routes.homeRouter);
app.use("/api", routes.apiRouter);
app.use("/teacher", routes.teacherRouter);
app.use("/student", routes.studentRouter);

routes.updateSocketRouter(io);

setup()

server.listen(process.env.PORT ?? 3000, () => console.log("App Started"));
