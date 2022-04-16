import express from "express";
import { teacherOnly } from "../util/authorizationHandler";
import { createSlot, deleteSlot } from "../util/slots";

let router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/create_slot", teacherOnly, async (req: any, res) => {
    let success = await createSlot({
        teacher_id: req.user._id,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        date: req.body.date,
        description: req.body.description
    })
    res.json({ success })
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