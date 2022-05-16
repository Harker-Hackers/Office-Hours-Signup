import express from "express";
import * as routes from "./routes"

(global as any).base = __dirname;

let app = express();
app.set("view engine", "ejs");

app.use("/", routes.homeRouter);
app.use("/help", routes.helpRouter);
app.use("/static", express.static(__dirname + "/static"));

app.listen(process.env.PORT ?? 8000, () => console.log("App running"));