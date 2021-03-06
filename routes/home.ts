import express from "express";
import { googleUser } from "../types";
import getGoogleUser from '../util/getGoogleUser';
import showError from "../util/showError";
import { createTeacher, getTeacher } from "../util/teacher";

let router = express.Router();

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.get("/", (req, res) => {
    res.render("home.ejs");
});

router.post("/user", async (req, res) => {
    let googleUser = await getGoogleUser(req.body.credential).catch(() => {
        showError(res, 500);
        res.end();
    }) as googleUser;
    if (googleUser.email?.endsWith("@harker.org") || googleUser.email === "25aaravb@students.harker.org") {
        getTeacher(googleUser.email, (value) => {
            if (value.results?.length === 0) {
                createTeacher({
                    _id: googleUser.sub,
                    email: googleUser.email,
                    name: googleUser.name,
                    picture: googleUser.picture,
                    given_name: googleUser.given_name,
                    family_name: googleUser.family_name
                });
            }
        });

        res.render("teacher/home.ejs", googleUser);
    } else if (googleUser.email?.endsWith("@students.harker.org")) {
        res.render("student/home.ejs", googleUser);
    } else if (googleUser.email?.endsWith("@staff.harker.org")) {
        res.render("home.ejs", {error: "Please use your @harker.org email."})
    } else {
        res.render("home.ejs", {error: "Please signin with your <b>Harker</b> email."})
    }
});

export default router;