import { QueryResponse } from "@rockset/client/dist/codegen/api";
import { addDocs, query } from "../db";
import { googleUser, QueryCallback } from "../types";

export const createStudent = (studentData: any) => {
    addDocs("students", [studentData]);
}

export const getStudent = (email: string) => {
    return new Promise((resolve,reject)=>{
        query({
            query: `select * from \"office-hours\".students where email='${email}'`
        }, resolve);
    })
}
