import { Student, Teacher, Slot } from "../types";
import { isTeacher, isStudent } from "../util/userHandler";
import { getTeacher } from "../util/teacher";
import { getStudent } from "../util/student";
import { getSlots, TeacherQuery, StudentQuery, MultiTeacherQuery } from "./slots";
const jwt = require("jsonwebtoken");
const jwtKey=require("../config.json").jwtKey;

export async function grabUserByEmail(email?:string)
{
    if(email==null)
        return null;
    if(isTeacher(email))
    {
        let j=await getTeacher(email) as any;
        if(j.results.length===0)
            return null;
        let slots=await getSlots(new TeacherQuery(j.results[0]._id));
        return {"teacher":true,...j.results[0],"slots":slots.results} as Teacher;
    } else if (isStudent(email))
    {
        let j=await getStudent(email) as any;
        if(j.results.length===0)
            return null;
        let slots=await getSlots(new StudentQuery(j.results[0]._id));
        let teacher_slots;
        if(j.results[0].teachers.length>0)
            teacher_slots=(await getSlots(new MultiTeacherQuery(j.results[0].teachers))).results;
        else
            teacher_slots=[];
        return {"teacher":false,"slots":slots.results,teacher_slots:teacher_slots,...j.results[0]} as Student;
    }
    return null;
}

function generateAccessToken(username:string) {
    return jwt.sign({"u":username}, jwtKey,{"expiresIn":"30m"});
}


export function login(req:any,res:any,user:any)
{
    let token=generateAccessToken(user.email);
    return res.cookie("jwt",token,{maxAge:3600000});
}

export async function teacherOnly(req:any,res:any,n:any)
{
    const token = req.cookies.jwt;
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, jwtKey);
        let user = await grabUserByEmail(data.u);
        if(user==null||!user.teacher)
            return res.sendStatus(403);
        req.user=user as Teacher;
        refresh(req,res,n);
    } catch {
        return res.sendStatus(403);
    }
}

export async function studentOnly(req:any,res:any,n:any)
{
    const token = req.cookies.jwt;
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, jwtKey);
        let user = await grabUserByEmail(data.u);
        if(user==null||user.teacher)
            return res.sendStatus(403);
        req.user=user as Student;
        refresh(req,res,n);
    } catch {
        return res.sendStatus(403);
    }
}

export async function refresh(req:any,res:any,n:any)
{
    const token = req.cookies.jwt;
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, jwtKey);
        let user = await grabUserByEmail(data.u);
        if(user==null)
            return res.sendStatus(403);
        login(req,res,user);
        n();
    } catch {
        return res.sendStatus(403);
    }
}