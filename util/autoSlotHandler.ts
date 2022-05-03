import { Slot } from "../types";
import {
    canCreateSlot,
    createSlots,
    deleteSlots,
    getSlots,
    SlotUtil,
    toSQLDate,
    toSQLTime,
} from "./slots";

export class AutoSlotHandler {
    constructor() {}

    async deleteOldSlots() {
        let d = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
        let slots = (await getSlots(new SlotUtil.DateBeforeQuery(toSQLDate(d))))
            .results;
        return await deleteSlots(
            slots?.map((k) => {
                return { _id: k._id };
            }) as { _id: string }[]
        );
    }
}
interface AutoSlot {
    startTime: string;
    endTime: string;
    date: string;
}
export abstract class AutoSlotGenerator {
    constructor() {}
    abstract generateSlot(): AutoSlot | null;
    generateSlots(): AutoSlot[] {
        let slots = [] as AutoSlot[];
        let currSlot = this.generateSlot();
        while (currSlot) {
            slots.push(currSlot);
        }
        return slots;
    }
    createSlots(teacher_id: string, description?: string) {
        let slots = this.generateSlots();
        slots = slots.map((k) => {
            return {
                ...k,
                teacher_id: teacher_id,
                description: description || "",
            };
        });
        createSlots(slots as Slot[]);
    }
}
export abstract class SafeAutoSlotGenerator extends AutoSlotGenerator {
    async generateSafeSlots(teacher_id: string): Promise<AutoSlot[]> {
        let slots = [] as any[];
        let currSlot = this.generateSlot(),currTestSlot:Slot;
        while (currSlot) {
            currTestSlot={...currSlot,teacher_id:teacher_id} as Slot;
            if(await canCreateSlot(currTestSlot)){
                slots.push(currSlot);
            }
            currSlot = this.generateSlot();
        }
        return slots;
    }
    async createSlots(teacher_id: string, description?: string) {
        let slots = await this.generateSafeSlots(teacher_id);
        slots = slots.map((k) => {
            return {
                ...k,
                teacher_id: teacher_id,
                description: description || "",
            };
        });
        slots.length&&await createSlots(slots as Slot[]);
    }
}
interface TimeSlot{
    startTime:string,endTime:string
}
interface JSONSlotConfig {
    dates: Map<string, Set<TimeSlot>>;
}
export class JSONSlotGenerator extends SafeAutoSlotGenerator {
    cfg: JSONSlotConfig;
    dateIter: IterableIterator<[string, Set<TimeSlot>]>;
    currDate: string;
    slotIter: IterableIterator<[TimeSlot, TimeSlot]>;
    static createJSONSlotConfig(obj: any) {
        let r = new Map();
        for (let k in obj) {
            r.set(k, new Set(obj[k]));
        }
        return { dates: r } as JSONSlotConfig;
    }
    constructor(cfg: JSONSlotConfig) {
        super();
        this.cfg = cfg;
        this.dateIter = cfg.dates.entries();
        let z=this.dateIter.next().value;
        this.currDate=z[0];
        this.slotIter=z[1].entries();
    }
    generateSlot(): AutoSlot | null {
        let n = this.slotIter.next();
        if (n.done) {
            let d = this.dateIter.next();
            if (d.done) return null;
            else {
                this.slotIter = d.value[1].entries();
                this.currDate=d.value[0];
                return this.generateSlot();
            }
        } else {
            let a=n.value[0];
            return {...a,date:this.currDate};
        }
    }
}

export const autoSlotHandler = new AutoSlotHandler();
