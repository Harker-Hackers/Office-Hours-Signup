import express from "express";
import { Slot } from "../types";
import { teacherOnly } from "../util/authorizationHandler";
import { createSlot } from "../util/slots";

let router = express.Router();

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.post("/create_slot",teacherOnly,async (req:any,res)=>{
    console.log({
        teacher_id: req.user._id,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        date: req.body.date,
        description: req.body.description
    });
    let success=await createSlot({
        teacher_id: req.user._id,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        date: req.body.date,
        description: req.body.description
    })
    console.log("H");
    res.json({success})
})

export default router;