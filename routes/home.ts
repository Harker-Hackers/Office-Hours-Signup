import express from "express";
import { googleUser } from "../types";
import { grabUserByEmail, login, teacherOnly } from "../util/authorizationHandler";
import getGoogleUser from '../util/getGoogleUser';
import showError from "../util/showError";
import { createTeacher } from "../util/teacher";
import { createStudent } from "../util/student";
import { isTeacher, isStudent } from "../util/userHandler";

let router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", (req, res) => {
    res.render("home.ejs");
});

router.get("/login", (req, res) => {
    res.render("login.ejs");
});

router.post("/login", async (req, res) => {
    let googleUser = await getGoogleUser(req.body.credential).catch(() => {
        showError(res, 500);
        res.end();
    }) as googleUser;
    if (googleUser == null)
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
        login(req, res, user);
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
                family_name: googleUser.family_name,
                teachers: []
            });
            user = await grabUserByEmail(googleUser.email);
        }
        login(req, res, user);
        res.redirect("/student");
    } else if (googleUser.email?.endsWith("@staff.harker.org")) {
        res.render("login.ejs", { error: "Please use your @harker.org email." });
    } else {
        res.render("login.ejs", { error: "Please signin with your <b>Harker</b> email." });
    }
});

export default router;