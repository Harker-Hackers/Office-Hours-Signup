import { QueryResponse } from "@rockset/client/dist/codegen/api";
import { addDocs, query, rmDocs, editDocs } from "../db";
import { googleUser, QueryCallback } from "../types";

export const createStudent = (studentData: any) => {
    addDocs("students", [studentData]);
}

export const addTeachersToStudent = async (student: { _id: string, teachers: string[] }, teachers: string[]) => {
    let new_teachers = Array.from(new Set([...student.teachers, ...teachers]));
    return await editDocs("students", [{
        _id: student._id, patch: [{
            op: 'REPLACE',
            path: '/teachers',
            value: new_teachers
        }]
    }]);
}

export const deleteStudent = (studentData: any) => {
    rmDocs("students", [studentData])
}

export const getStudent = (email: string) => {
    return new Promise<QueryResponse>((resolve, reject) => {
        query({
            query: `select * from \"office-hours\".students where email='${email}'`
        }, resolve);
    })
}
