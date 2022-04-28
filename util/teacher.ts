import { QueryRequestSql, QueryResponse } from "@rockset/client/dist/codegen/api";
import { addDocs, query } from "../db";
import { QueryCallback } from "../types";

export const createTeacher = (teacherData: any) => {
    addDocs("teachers", [teacherData]);
};

export const getTeacher = (email: string) => {
    return new Promise((resolve, reject) => {
        query(
            {
                query: `select * from \"office-hours\".teachers where email=:email`,
                parameters: [
                    {
                        name: "email",
                        type: "string",
                        value: email,
                    },
                ],
            },
            resolve
        );
    });
};

export const getAllTeachers = (ids: string[]) => {
    if(ids.length==0)
        return null;
    let params=[] as {name:string,type:string,value:string}[];
    let q="select * from \"office-hours\".teachers where";
    for(let i=0;i<ids.length;i++)
    {
        i==0?q+=" ":q+=" or ";
        q+="_id=:id"+i;
        params.push({name:"id"+i,type:"string",value:ids[i]});
    }
    console.log(q);
    console.log(params)
    return new Promise<QueryResponse>((resolve,reject)=>{
        query(
            {
                query:q,
                parameters:params
            },resolve
        )
    })
}
