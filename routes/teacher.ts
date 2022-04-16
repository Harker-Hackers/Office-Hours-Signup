import { teacherOnly } from "../util/authorizationHandler";
import express from "express";

let router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", teacherOnly, async (req: any, res) => {
    res.render("teacher/home.ejs", req.user);
});

export default router;