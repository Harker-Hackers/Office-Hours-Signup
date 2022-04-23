import express from "express";
import * as routes from "./routes";

(global as any).base = __dirname;

let app = express();
app.set("view engine", "ejs");
app.use(require("cookie-parser")());

app.use("/static", express.static(__dirname + "/static"));
app.use("/", routes.homeRouter);
app.use("/api", routes.apiRouter);
app.use("/teacher", routes.teacherRouter);
app.use("/student", routes.studentRouter);

app.listen(process.env.PORT ?? 3000, () => console.log("App running"));
