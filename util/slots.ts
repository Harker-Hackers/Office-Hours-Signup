import { QueryCallback, Slot } from "../types";
import { addDocs, editDocs, query, rmDocs } from "../db";
import {
    OrgPaymentMethodResponse,
    QueryResponse,
} from "@rockset/client/dist/codegen/api";

export function toSQLDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

export function toSQLDateTime(date: Date) {
    return date.toISOString().slice(0, 19).replace("T", " ");
}

export function toSQLTime(date: Date) {
    return date.toISOString().slice(10, 19).replace("T", "");
}

export const canCreateSlot = async (slotData: Slot) => {
    let sl = await getSlots(
        new TeacherQuery(slotData.teacher_id),
        new OverlapQuery(slotData.startTime, slotData.endTime),
        new DateQuery(slotData.date)
    );
    return (
        sl.results?.length == 0 &&
        Date.parse("1970-01-01 " + slotData.endTime) >
            Date.parse("1970-01-01 " + slotData.startTime) + 1000 * 300
    );
};
export const createSlot = async (slotData: {
    date?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    teacher_id: string;
    student_email?: string;
}) => {
    slotData.date = slotData.date || toSQLDate(new Date());
    slotData.startTime = slotData.startTime || toSQLTime(new Date());
    slotData.endTime = slotData.endTime || toSQLTime(new Date());
    slotData.description = slotData.description || "";
    slotData.student_email = slotData.student_email || "";
    let slot;
    if (await canCreateSlot(slotData as Slot)) {
        slot = {
            date: slotData.date,
            startTime: slotData.startTime,
            endTime: slotData.endTime,
            description: slotData.description,
            teacher_id: slotData.teacher_id,
            student_email: slotData.student_email,
        };
        let success = await addDocs("slots", [slot]);
        if (success.data != undefined && !success.data[0].error)
            return {
                success: true,
                slot: { ...slot, _id: success.data[0]._id },
            };
    }
    return { success: false };
};
export const createSlots = async (
    a: {
        startTime: string;
        endTime: string;
        teacher_id: string;
        date: string;
    }[]
) => {
    let success = await addDocs(
        "slots",
        a.map((k) => {
            return {
                student_email: "",
                description: "",
                ...k,
            };
        })
    );
    return success.data != undefined && !success.data[0].error;
};

export const deleteSlot = async (slot: { _id: string }) => {
    let success = await rmDocs("slots", [{ _id: slot._id }]);
    if (success.data != undefined) return success.data[0].error == null;
    return false;
};

export const deleteSlots = async (slots: { _id: string }[]) => {
    let success = await rmDocs("slots", slots);
    if (success.data != undefined) return success.data[0].error == null;
    return false;
};

export const getSlotById = (id: string) => {
    return new Promise((resolve, reject) => {
        query(
            {
                query: `select * from \"office-hours\".slots where _id='${id}'`,
            },
            resolve
        );
    });
};

export const editSlot = async (id: string, patches: any) => {
    return await editDocs("slots", [
        {
            _id: id,
            patch: patches,
        },
    ]);
};

export const addStudentToMeeting = async (student: string, slot: string) => {
    return await editSlot(slot, [
        {
            op: "REPLACE",
            path: "/student_email",
            value: student,
        },
    ]);
};

/*
export const getSlotsByTeacherId = (id: number) => {
    return new Promise((resolve,reject)=>{
        query({
            query: `select * from \"office-hours\".slots where teacher_id='${id}'`
        }, resolve);
    })
}

export const getSlotsByTeacher = (teacher:any) => {
    return new Promise((resolve,reject)=>{
        query({
            query: `select * from \"office-hours\".slots where teacher_id='${teacher._id}'`
        }, resolve);
    })
}
*/
class MySlotQuery {
    query: string;
    parameters: { name: string; type: string; value: string }[];
    is_query: boolean;
    constructor(
        query: string,
        params: { name: string; type: string; value: string }[]
    ) {
        this.query = query;
        this.parameters = params;
        this.is_query = true;
    }
    join(query: MySlotQuery) {
        this.query += (query.is_query ? " and " : " ") + query.query;
        this.parameters = [...this.parameters, ...query.parameters];
    }
    add(query: MySlotQuery) {
        this.join(query);
        return this;
    }
    construct_query() {
        return (
            'select * from "office-hours".slots ' +
            (this.query == "" ? "" : "where " + this.query)
        );
    }
    construct_my_query(mcq: string) {
        return mcq + (this.query == "" ? "" : "where " + this.query);
    }
    get_special(mqb: string) {
        return new Promise<QueryResponse>((resolve, reject) => {
            query(
                {
                    query: this.construct_my_query(mqb),
                    parameters: this.parameters,
                },
                resolve
            );
        });
    }
    get() {
        //console.log(this.construct_query())
        return new Promise<QueryResponse>((resolve, reject) => {
            query(
                {
                    query: this.construct_query(),
                    parameters: this.parameters,
                },
                resolve
            );
        });
    }
}

export class TeacherQuery extends MySlotQuery {
    constructor(teacher: string) {
        super(`teacher_id = :teachername`, [
            {
                name: "teachername",
                type: "string",
                value: teacher,
            },
        ]);
    }
}

export class MultiTeacherQuery extends MySlotQuery {
    constructor(teacher: string[]) {
        let qu = "(";
        let params = [];
        for (let i = 0; i < teacher.length; i++) {
            if (i != 0) qu += " OR ";
            qu += "teacher_id = :teachername" + i;
            params.push({
                name: "teachername" + i,
                type: "string",
                value: teacher[i],
            });
        }
        qu += ")";
        super(qu, params);
    }
}

export class DateQuery extends MySlotQuery {
    constructor(date: string | Date) {
        if (typeof date === "string")
            super(`date = :date`, [
                {
                    name: "date",
                    type: "string",
                    value: date,
                },
            ]);
        else
            super(`date = :date`, [
                {
                    name: "date",
                    type: "string",
                    value: toSQLDate(date),
                },
            ]);
    }
}

export class TimeRangeQuery extends MySlotQuery {
    constructor(mintime: string | Date, maxtime: string | Date) {
        if (!(typeof mintime == "string")) mintime = toSQLTime(mintime);
        if (!(typeof maxtime == "string")) maxtime = toSQLTime(maxtime);
        super(
            `CAST(startTime as time) >= :mintime and CAST(endTime as time) <= :maxtime`,
            [
                {
                    name: "mintime",
                    type: "time",
                    value: mintime,
                },
                {
                    name: "maxtime",
                    type: "time",
                    value: maxtime,
                },
            ]
        );
    }
}

export class NoOverlapQuery extends MySlotQuery {
    constructor(mintime: string | Date, maxtime: string | Date) {
        if (!(typeof mintime == "string")) mintime = toSQLTime(mintime);
        if (!(typeof maxtime == "string")) maxtime = toSQLTime(maxtime);
        super(
            `CAST(startTime as time) > :mintime or CAST(endTime as time) < :maxtime`,
            [
                {
                    name: "mintime",
                    type: "time",
                    value: mintime,
                },
                {
                    name: "maxtime",
                    type: "time",
                    value: maxtime,
                },
            ]
        );
    }
}
export class OverlapQuery extends MySlotQuery {
    constructor(mintime: string | Date, maxtime: string | Date) {
        if (!(typeof mintime == "string")) mintime = toSQLTime(mintime);
        if (!(typeof maxtime == "string")) maxtime = toSQLTime(maxtime);
        super(
            `CAST(startTime as time) < :maxtime and CAST(endTime as time) > :mintime`,
            [
                {
                    name: "mintime",
                    type: "time",
                    value: mintime,
                },
                {
                    name: "maxtime",
                    type: "time",
                    value: maxtime,
                },
            ]
        );
    }
}

export class DateTimeRangeQuery extends MySlotQuery {
    constructor(
        date: string | Date,
        mintime: string | Date,
        maxtime: string | Date
    ) {
        if (!(typeof date == "string")) date = toSQLDate(date);
        if (!(typeof mintime == "string")) mintime = toSQLTime(mintime);
        if (!(typeof maxtime == "string")) maxtime = toSQLTime(maxtime);
        super(
            `CAST(startTime as time) >= :mintime and CAST(endTime as time) <= :maxtime and date = :date`,
            [
                {
                    name: "mintime",
                    type: "time",
                    value: mintime,
                },
                {
                    name: "maxtime",
                    type: "time",
                    value: maxtime,
                },
                {
                    name: "date",
                    type: "string",
                    value: date,
                },
            ]
        );
    }
}

export class NullQuery extends MySlotQuery {
    constructor() {
        super(`teacher_id is null`, []);
    }
}

export class StudentQuery extends MySlotQuery {
    constructor(student: string) {
        super(`student_email = :student`, [
            { name: "student", type: "string", value: student },
        ]);
    }
}

export class StudentAvailableQuery extends MySlotQuery {
    constructor(student: string) {
        super(`(student_email = :student OR student_email = '')`, [
            { name: "student", type: "string", value: student },
        ]);
    }
}

export class IDQuery extends MySlotQuery {
    constructor(id: string) {
        super(`_id = :id`, [
            {
                name: "id",
                type: "string",
                value: id,
            },
        ]);
    }
}

export class DateBeforeQuery extends MySlotQuery {
    constructor(mdate: string) {
        super(`CAST(date as date)<=:mdate`, [
            { name: "mdate", type: "date", value: mdate },
        ]);
    }
}

export class StartTimeOrder extends MySlotQuery {
    constructor() {
        super(`order by CAST(startTime as time)`, []);
        this.is_query = false;
    }
}

export class StartDateTimeOrder extends MySlotQuery {
    constructor() {
        super(
            `order by PARSE_DATETIME_ISO8601(CONCAT(FORMAT_ISO8601(cast(date as date))," ",FORMAT_ISO8601(CAST(time as time))))`,
            []
        );
        this.is_query = false;
    }
}

export const SlotUtil = {
    TimeRangeQuery,
    DateQuery,
    TeacherQuery,
    NullQuery,
    DateTimeRangeQuery,
    StudentQuery,
    MultiTeacherQuery,
    StudentAvailableQuery,
    IDQuery,
    NoOverlapQuery,
    OverlapQuery,
    DateBeforeQuery,
    StartTimeOrder,
    StartDateTimeOrder,
};

/**
 * Used to get slots based on queries
 * Sample Usage:
 *     slots = await getSlots(new TeacherSlotQuery(342),new DateSlotQuery("2022-04-10"))
 * @param q list of queries
 * @return promise
 */
export const getSlots = (...q: MySlotQuery[]): Promise<QueryResponse> => {
    let z = null;
    for (let i = 0; i < q.length; i++) {
        if (i != q.length - 1) {
            if (!q[i].is_query)
                throw Error(
                    "QueryConstructionException: order must be the last"
                );
        }
        if (z == null) z = q[i] as MySlotQuery;
        else z.add(q[i]);
    }
    if (z != null) return z.get();
    else return new MySlotQuery("", []).get();
};

export const getSpecialSlots = (
    r: string,
    params: { name: string; type: string; value: string }[],
    ...q: MySlotQuery[]
): Promise<QueryResponse> => {
    let z = null;
    for (let i = 0; i < q.length; i++) {
        if (i != q.length - 1) {
            if (!q[i].is_query)
                throw Error(
                    "QueryConstructionException: order must be the last"
                );
        }
        if (z == null) z = q[i] as MySlotQuery;
        else z.add(q[i]);
    }
    if (z != null) {
        z.parameters = [...z.parameters, ...params];
        return z.get_special(r + " ");
    } else return new MySlotQuery("", []).get_special(r + " ");
};
