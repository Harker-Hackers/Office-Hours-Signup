import express from "express";
import comingSoon from "../util/sendComingSoon";

let router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.get("/", (req, res) => { res.render("home.ejs") });
router.get("/about", (req, res) => { res.redirect("/") });
router.get("/settings", comingSoon);
router.get("/report", comingSoon);

export default router;