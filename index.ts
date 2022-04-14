import express from "express";
import homeRouter from "./routes/home";
import apiRouter from "./routes/api";

(global as any).base = __dirname;

let app = express();
app.set("view engine", "ejs");
app.use(require("cookie-parser")());
app.use("/", homeRouter);
app.use("/api",apiRouter)

app.listen(process.env.PORT ?? 3000, () => console.log("App running"));