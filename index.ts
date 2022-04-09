import express from "express";
import homeRouter from "./routes/home";

(global as any).base = __dirname;

let app = express();
app.set("view engine", "ejs");

app.use("/", homeRouter);

app.listen(process.env.PORT ?? 3000, () => console.log("App running"));