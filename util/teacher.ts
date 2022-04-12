import { addDocs, query } from "../db";
import { QueryCallback } from "../types";

export const createTeacher = (teacherData: any) => {
    addDocs("teachers", [teacherData]);
}

export const getTeacher = (email: string, callback: QueryCallback) => {
    query({
        query: `select * from \"office-hours\".teachers where email=:email`,
        parameters: [{
            name: "email",
            type: "string",
            value: email
        }]
    }, callback);
}