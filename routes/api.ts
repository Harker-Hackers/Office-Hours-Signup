import express from "express";
import { Student, Teacher } from "../types";
import { teacherOnly, studentOnly, isStoredTeacher, isStoredStudent } from "../util/authorizationHandler";
import { addStudentToMeeting, createSlot, deleteSlot, getSlots, IDQuery, StudentAvailableQuery, StudentQuery } from "../util/slots";
import { addTeachersToStudent, setStudentTeachers } from "../util/student";

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

router.post("/add_teacher",studentOnly, async (req:any, res) => {
    let success = await addTeachersToStudent(req.user,req.body.teachers)
    res.json({ success });
})

router.post("/change_teachers",studentOnly,async(req:any,res)=>{
    let success = await setStudentTeachers(req.user,req.body.teachers);
    res.json({ success });
})

router.post("/join_meeting",studentOnly,async(req:any,res)=>{
    try{
        let slot = await getSlots(new StudentAvailableQuery(req.user.email), new IDQuery(req.body.id))
        if(!slot||!slot.results||slot.results.length==0){throw new Error("Slot wasn't found")}
        let success = await addStudentToMeeting(req.user.email,slot.results[0]._id);
        res.json({success:(success.data != undefined && !success.data[0].error)})
    } catch(err){
        res.json({success:false});
    }
})

router.post("/leave_meeting",studentOnly,async(req:any,res)=>{
    try{
        let slot = await getSlots(new StudentQuery(req.user.email), new IDQuery(req.body.id))
        if(!slot||!slot.results||slot.results.length==0){throw new Error("Slot wasn't found")}
        let success = await addStudentToMeeting("",slot.results[0]._id);
        res.json({success:(success.data != undefined && !success.data[0].error)})
    } catch(err){
        res.json({success:false});
    }
})

export default router;