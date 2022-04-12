import express from "express";
import { googleUser, Slot } from "../types";
import { grabUserByEmail, login, teacherOnly, studentOnly } from "../util/authorizationHandler";
import getGoogleUser from '../util/getGoogleUser';
import showError from "../util/showError";
import { createTeacher } from "../util/teacher";
import { createStudent } from "../util/student";
import { isTeacher, isStudent } from "../util/userHandler";
import { SlotQuery, getSlots, createSlot, deleteSlot } from "../util/slots";
import { User } from "@rockset/client/dist/codegen/api";

let router = express.Router();

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.get("/", (req, res) => {
    res.render("home.ejs");
});

router.post("/", async (req, res) => {
    let googleUser = await getGoogleUser(req.body.credential).catch(() => {
        showError(res, 500);
        res.end();
    }) as googleUser;
    if(googleUser==null)
        return res.status(500);
    if (isTeacher(googleUser.email)) {
        let user = await grabUserByEmail(googleUser.email);
        if (user === null) {
            createTeacher({
                _id: googleUser.sub,
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture,
                given_name: googleUser.given_name,
                family_name: googleUser.family_name
            });
            user = await grabUserByEmail(googleUser.email);
        }
        login(req,res,user);
        res.redirect("/teacher")
    } else if (isStudent(googleUser.email)) {
        let user = await grabUserByEmail(googleUser.email);
        if (user === null) {
            createStudent({
                _id: googleUser.sub,
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture,
                given_name: googleUser.given_name,
                family_name: googleUser.family_name
            });
            user = await grabUserByEmail(googleUser.email);
        }
        login(req,res,user);
        res.redirect("/student");
    } else if (googleUser.email?.endsWith("@staff.harker.org")) {
        res.render("home.ejs", {error: "Please use your @harker.org email."})
    } else {
        res.render("home.ejs", {error: "Please signin with your <b>Harker</b> email."})
    }
});

router.get("/teacher",teacherOnly,async (req:any,res)=>{
    res.render("teacher/home.ejs",req.user);
});

router.get("/student",studentOnly,async (req:any,res)=>{
    res.render("student/home.ejs",req.user);
});

export default router;