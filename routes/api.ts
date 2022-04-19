import express from "express";
import { Student, Teacher } from "../types";
import { teacherOnly, studentOnly, isStoredTeacher, isStoredStudent } from "../util/authorizationHandler";
import { createSlot, deleteSlot } from "../util/slots";

let router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/get_user", async (req, res) => {
    let teacher = (await isStoredTeacher(req, res));
    let student = (await isStoredStudent(req, res));
    if (teacher[0] === 200) {
        (teacher[1] as Teacher).role = "teacher";
        res.send(teacher[1]);
    } else if (student[0] === 200) {
        (student[1] as Student).role = "student";
        res.send(student[1]);
    } else {
        res.send({});
    }
});

router.post("/create_slot", teacherOnly, async (req: any, res) => {
    let { success, slot } = await createSlot({
        teacher_id: req.user._id,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        date: req.body.date,
        description: req.body.description
    })
    res.json({ success, slot });
})

router.post("/delete_slot", teacherOnly, async (req: any, res) => {
    let success = await deleteSlot({ _id: req.body.id });
    res.json({ success });
})

router.get("/delete_slots", teacherOnly, (req: any, res) => {
    let slots = req.user.slots;
    for (let i = 0; i < slots.length; i++) {
        deleteSlot(slots[i]);
    }
})

export default router;