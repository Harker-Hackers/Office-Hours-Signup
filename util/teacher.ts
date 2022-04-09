import { QueryResponse } from "@rockset/client/dist/codegen/api";
import { addDocs, query } from "../db";
import { googleUser, QueryCallback } from "../types";

export const createTeacher = (teacherData: any) => {
    addDocs("teachers", [teacherData]);
}

export const getTeacher = (email: string, callback: QueryCallback) => {
    query({
        query: `select * from \"office-hours\".teachers where email='${email}'`
    }, callback);
}