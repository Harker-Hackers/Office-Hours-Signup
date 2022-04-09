import express from "express";
import homeRouter from "./routes/home";

(global as any).base = __dirname;
(global as any).googleClientId = "582829001790-6u1eiea25r6g998jrn6gg2ocmj8jnb0m.apps.googleusercontent.com";

let app = express();
app.set("view engine", "ejs");

app.use("/", homeRouter);

app.listen(process.env.PORT ?? 3000, () => console.log("App running"));