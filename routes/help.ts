import express from "express";
import comingSoon from "../util/sendComingSoon";

let router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.get("/", comingSoon);
router.get("/teacher", comingSoon);
router.get("/student", comingSoon);
router.get("/report", comingSoon);

export default router;