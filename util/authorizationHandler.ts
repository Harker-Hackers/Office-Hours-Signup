import { Student, Teacher, Slot } from "../types";
import { isTeacher, isStudent } from "../util/userHandler";
import { getTeacher } from "../util/teacher";
import { getStudent } from "../util/student";
import { getSlots, TeacherQuery, StudentQuery, MultiTeacherQuery, StudentAvailableQuery } from "./slots";
const jwt = require("jsonwebtoken")
const jwtKey = require("../config.json").jwtKey;

export async function grabUserByEmail(email?: string) {
    if (email == null)
        return null;
    if (isTeacher(email)) {
        let j = await getTeacher(email) as any;
        if (j.results.length === 0)
            return null;
        let slots = await getSlots(new TeacherQuery(j.results[0]._id));
        return { "teacher": true, ...j.results[0], "slots": slots.results } as Teacher;
    } else if (isStudent(email)) {
        let j = await getStudent(email) as any;
        if (j.results.length === 0)
            return null;
        let slots = await getSlots(new StudentQuery(j.results[0]._id));
        let teacher_slots;
        if (j.results[0].teachers.length > 0)
            teacher_slots = (await getSlots(new MultiTeacherQuery(j.results[0].teachers), new StudentAvailableQuery(email))).results;
        else
            teacher_slots = [];
        return { "teacher": false, "slots": slots.results, teacher_slots: teacher_slots, ...j.results[0] } as Student;
    }
    return null;
}

function generateAccessToken(username: string) {
    return jwt.sign({ "u": username }, jwtKey, { "expiresIn": "30m" });
}


export function login(req: any, res: any, user: any) {
    let token = generateAccessToken(user.email);
    return res.cookie("jwt", token, { maxAge: 3600000 });
}

export async function teacherOnly(req: any, res: any, n: any) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect("/login");;
    }
    try {
        const data = jwt.verify(token, jwtKey);
        let user = await grabUserByEmail(data.u);
        if (user == null || !user.teacher)
            return res.redirect("/login");;
        req.user = user;
        refresh(req, res, n);
    } catch {
        return res.redirect("/login");;
    }
}

export async function isStoredTeacher(req: any, res: any) {
    const token = req.cookies.jwt;
    if (!token) {
        return [500, {}]
    }
    try {
        const data = jwt.verify(token, jwtKey);
        let user = await grabUserByEmail(data.u);
        if (user == null || !user.teacher || user==undefined || !user)
            return [500, {}]
        return [200, user];
    } catch {
        return [500, {}];
    }
}

export async function studentOnly(req: any, res: any, n: any) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect("/login");;
    }
    try {
        const data = jwt.verify(token, jwtKey);
        let user = await grabUserByEmail(data.u);
        if (user == null || user.teacher)
            return res.redirect("/login");;
        req.user = user;
        refresh(req, res, n);
    } catch {
        return res.redirect("/login");;
    }
    //return 200;
}

export async function isStoredStudent(req: any, res: any) {
    const token = req.cookies.jwt;
    if (!token) {
        return [500, {}]
    }
    try {
        const data = jwt.verify(token, jwtKey);
        let user = await grabUserByEmail(data.u);
        if (user == null || user.teacher)
            return [500, {}]
        return [200, user];
    } catch {
        return [500, {}]
    }
}

export async function refresh(req: any, res: any, n: any) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect("/login");;
    }
    try {
        const data = jwt.verify(token, jwtKey);
        let user = await grabUserByEmail(data.u);
        if (user == null)
            return res.redirect("/login");;
        login(req, res, user);
        n();
    } catch {
        return res.redirect("/login");;
    }
}