import { QueryCallback, Slot } from "../types";
import { addDocs, query, rmDocs } from "../db";
import { QueryResponse } from "@rockset/client/dist/codegen/api";

export function toSQLDate(date:Date)
{
    return date.toISOString().slice(0,10);
}

export function toSQLDateTime(date:Date)
{
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export function toSQLTime(date:Date)
{
    return new Date().toISOString().slice(10, 19).replace('T', '');
}

export const createSlot = (slotData: {date?:string,starttime?:string,endtime?:string,description?:string,teacher_id:string,student_email?:string}) => {
    console.log("pass1");
    addDocs("slots", [{
        date:slotData.date||toSQLDate(new Date()),
        starttime:slotData.starttime||toSQLTime(new Date()),
        endtime:slotData.endtime||toSQLTime(new Date()),
        description:slotData.description||"",
        teacher_id:slotData.teacher_id,
        student_email:slotData.student_email||""
    }]);
}

export const deleteSlot = (slot:{_id:string}) => {
    rmDocs("slots",[{_id:slot._id}]);
}

export const getSlotById = (id: string) => {
    return new Promise((resolve,reject)=>{
        query({
            query: `select * from \"office-hours\".slots where _id='${id}'`
        }, resolve);
    })
}
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
    parameters: {name:string,type:string,value:string}[];
    constructor(query:string,params:{name:string,type:string,value:string}[])
    {
        this.query=query;
        this.parameters=params;
    }
    join(query:MySlotQuery)
    {
        this.query+=" and "+query.query;
        this.parameters=[...this.parameters,...query.parameters];
    }
    add(query:MySlotQuery)
    {
        this.join(query);
        return this;
    }
    get()
    {
        console.log("select * from \"office-hours\".slots " + (this.query==""?"":"where "+this.query));
        return new Promise<QueryResponse>((resolve,reject)=>{
            query({
                query: "select * from \"office-hours\".slots " + (this.query==""?"":"where "+this.query),
                parameters:this.parameters
            }, resolve);
        })
    }
}

export class TeacherSlotQuery extends MySlotQuery
{
    constructor(teacher:string)
    {
        super(`teacher_id = :teachername`,
        [{
            name:"teachername",
            type:"string",
            value:teacher.toString()
        }])
    }
}

export class DateSlotQuery extends MySlotQuery
{
    constructor(date:string|Date)
    {
        if(typeof date === "string")
            super(`date = :date`,
            [{
                name:"date",
                type:"string",
                value:date
            }])
        else
            super(`date = :date`,
            [{
                name:"date",
                type:"string",
                value:toSQLDate(date)
            }])
    }
}

export class TimeRangeSlotQuery extends MySlotQuery
{
    constructor(mintime:string|Date,maxtime:string|Date)
    {
        if(!(typeof(mintime)=="string"))
            mintime=toSQLTime(mintime);
        if(!(typeof(maxtime)=="string"))
            maxtime=toSQLTime(maxtime);
        super(`CAST(starttime as time) >= :mintime and CAST(endtime as time) <= :maxtime`,
        [{
            name:"mintime",
            type:"time",
            value:mintime
        },{
            name:"maxtime",
            type:"time",
            value:maxtime
        }])
    }
}

export const SlotQuery = { TimeRangeSlotQuery, DateSlotQuery, TeacherSlotQuery }

/**
 * Used to get slots based on queries
 * Sample Usage:
 *     slots = await getSlots(new TeacherSlotQuery(342),new DateSlotQuery("2022-04-10"))
 * @param q list of queries
 * @returns promise
 */
export const getSlots = (...q:MySlotQuery[]): Promise<QueryResponse>=> {
    let z=null;
    for(let i=0;i<q.length;i++)
    {
        if(z==null)
            z=q[i] as MySlotQuery;
        else
            z.add(q[i]);
    }
    if(z!=null)
        return z.get();
    else
        return new MySlotQuery("",[]).get();
}