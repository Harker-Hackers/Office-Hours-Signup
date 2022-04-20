import { studentSlotOnly } from "../util/authorizationHandler";
import express from "express";

let router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", studentSlotOnly, async (req: any, res) => {
    res.render("student/home.ejs", req.user);
});

export default router;