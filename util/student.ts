import { PatchDocumentsResponse, QueryResponse } from "@rockset/client/dist/codegen/api";
import { addDocs, query, rmDocs, editDocs } from "../db";
import { googleUser, QueryCallback, Slot } from "../types";

export const createStudent = (studentData: any) => {
    addDocs("students", [studentData]);
}

const isSuccess = function (r: PatchDocumentsResponse) {
    return (r.data != undefined && !r.data[0].error)
}

export const addTeachersToStudent = async (student: { _id: string, teachers: string[] }, teachers: string[]) => {
    let new_teachers = Array.from(new Set([...student.teachers, ...teachers]));
    return isSuccess(await editDocs("students", [{
        _id: student._id, patch: [{
            op: "REPLACE",
            path: "/teachers",
            value: new_teachers
        }]
    }]));
}

export const setStudentTeachers = async (student: { _id: string }, teachers: string[]) => {
    return isSuccess(await editDocs("students", [{
        _id: student._id, patch: [{
            op: 'REPLACE',
            path: '/teachers',
            value: teachers
        }]
    }]))
}

export const canEditSlot = (student: { email: string }, slot: { student_email?: string }) => {
    return slot.student_email == student.email || !slot.student_email;
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
