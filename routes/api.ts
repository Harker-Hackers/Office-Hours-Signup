import express from "express";
import { Student, Teacher } from "../types";
import {
    teacherSlotOnly,
    studentSlotOnly,
    isStoredTeacher,
    isStoredStudent,
    studentOnly,
    teacherOnly,
} from "../util/authorizationHandler";
import {
    addStudentToMeeting,
    createSlot,
    deleteSlot,
    getSlots,
    SlotUtil,
    getSpecialSlots,
} from "../util/slots";
import {
    addTeachersToStudent,
    setStudentTeachers,
    validateTeacherIDs,
    deleteStudentTeachers,
} from "../util/student";
import updateHandler from "../util/socketUpdateHandler";
import { studentEmailHandler } from "../util/emailHandler";
import { JSONSlotGenerator } from "../util/autoSlotHandler";

let router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/get_user", async (req, res) => {
    let teacher = await isStoredTeacher(req, res);
    let student = await isStoredStudent(req, res);
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

router.post("/create_slot", teacherSlotOnly, async (req: any, res) => {
    let { success, slot } = await createSlot({
        teacher_id: req.user._id,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        date: req.body.date,
        reason: req.body.reason,
    });
    success && updateHandler.updateFocus(req.user._id, "new_slot", slot);
    res.json({ success, slot });
});

router.post("/delete_slot", teacherSlotOnly, async (req: any, res) => {
    let slots = await getSlots(new SlotUtil.IDQuery(req.body.id));
    let slot;
    if (slots.results) slot = slots.results[0];
    let success = await deleteSlot({ _id: req.body.id });
    success &&
    slots &&
        (updateHandler.updateFocus(req.user._id, "del_slot", slot._id),
        slot.student_email && (
            studentEmailHandler.cancelSlot(
                slot.student_email,
                req.user.name,
                slot.date,
                slot.startTime,
                slot.endTime,
                req.body.reason
            ),
            updateHandler.updateSocket(
                updateHandler.generateUID(slot.student_email, false),
                "del_meeting",
                slot._id)
            )
        );
    res.json({ success });
});

router.post("/add_teachers", studentSlotOnly, async (req: any, res) => {
    let success = await addTeachersToStudent(
        req.user,
        await validateTeacherIDs(req.body.teachers)
    );
    res.json({ success });
});

router.post("/change_teachers", studentSlotOnly, async (req: any, res) => {
    let success = await setStudentTeachers(
        req.user,
        await validateTeacherIDs(req.body.teachers)
    );
    res.json({ success });
});

router.post("/delete_teachers", studentSlotOnly, async (req: any, res) => {
    let success = await deleteStudentTeachers(
        req.user,
        await validateTeacherIDs(req.body.teachers)
    );
    res.json({ success });
});

router.post("/join_meeting", studentSlotOnly, async (req: any, res) => {
    try {
        let slot = await getSlots(
            new SlotUtil.StudentAvailableQuery(req.user.email),
            new SlotUtil.IDQuery(req.body.id)
        );
        //add something to make sure slots dont overlap
        if (!slot || !slot.results || slot.results.length == 0) {
            throw new Error("Slot wasn't found");
        }
        let sl = slot.results[0];
        let rsl = await getSlots(
            new SlotUtil.OverlapQuery(sl.startTime, sl.endTime),
            new SlotUtil.DateQuery(sl.date),
            new SlotUtil.StudentQuery(req.user.email)
        );
        if (rsl && rsl.results && rsl.results.length > 0)
            throw new Error("Slot overlaps :(");
        let success = await addStudentToMeeting(
            req.user.email,
            slot.results[0]._id
        );
        let s = success.data != undefined && !success.data[0].error;
        s &&
            updateHandler.updateSocket(
                updateHandler.generateUID(sl.teacher_id, true),
                "meeting_change",
                {
                    slot_id: slot.results[0]._id,
                    data: {
                        student_email: req.user.email,
                    },
                }
            );
        res.json({
            success: s,
        });
    } catch (err) {
        res.json({ success: false });
    }
});

router.post("/leave_meeting", studentSlotOnly, async (req: any, res) => {
    try {
        let slot = await getSlots(
            new SlotUtil.StudentQuery(req.user.email),
            new SlotUtil.IDQuery(req.body.id)
        );
        if (!slot || !slot.results || slot.results.length == 0) {
            throw new Error("Slot wasn't found");
        }
        let success = await addStudentToMeeting("", slot.results[0]._id);
        let s = success.data != undefined && !success.data[0].error;
        s &&
            updateHandler.updateSocket(
                updateHandler.generateUID(slot.results[0].teacher_id, true),
                "meeting_change",
                {
                    slot_id: slot.results[0]._id,
                    data: {
                        student_email: "",
                    },
                }
            );
        res.json({
            success: s,
        });
    } catch (err) {
        res.json({ success: false });
    }
});
router.post("/get_teacher_slots", studentOnly, async (req: any, res) => {
    try {
        let teacher_slots = await getSpecialSlots(
            `SELECT *,
        CASE WHEN student_email='' THEN ''
        WHEN student_email=:emailspeciallmao THEN student_email
        ELSE 'occupied'
        END AS student_email
        FROM "office-hours".slots s `,
            [
                {
                    name: "emailspeciallmao",
                    value: req.user.email,
                    type: "string",
                },
            ],
            new SlotUtil.TeacherQuery(req.body.teacher)
        );
        //updateHandler.focusStudent(updateHandler.generateUID(req.user.email,false),req.body.teacher);
        res.json({ success: true, slots: teacher_slots.results });
    } catch (err) {
        res.json({ success: false });
    }
});

router.post("/generate_slots_from_json", teacherOnly, async (req: any, res) => {
    console.log(req.body);
    console.log(JSONSlotGenerator.createJSONSlotConfig(req.body));
    let z = new JSONSlotGenerator(
        JSONSlotGenerator.createJSONSlotConfig(req.body)
    );
    z.createSlots(req.user._id);
});

export default router;

function validateTeacherIds(teachers: any): any {
    throw new Error("Function not implemented.");
}
