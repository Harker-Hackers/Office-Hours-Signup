import express from "express";

let app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT ?? 3000, () => console.log("App running"));