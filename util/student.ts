import {
    QueryResponse,
} from "@rockset/client/dist/codegen/api";
import {
    addDocs,
    query,
    rmDocs,
    editDocs,
    isPatchSuccess,
    isQuerySuccess,
} from "../db";
import { getAllTeachers } from "./teacher";

export const createStudent = (studentData: any) => {
    addDocs("students", [studentData]);
};

export const validateTeacherIDs = async (ids: string[]): Promise<any> => {
    try {
        if (!ids.length) return {};
        let q = await getAllTeachers(ids);
        if (q == null) return {};
        let ret = {} as any;
        if (isQuerySuccess(q))
            q.results?.forEach((r) => {
                ret[r._id] = r.email;
            });
        return ret;
    } catch (err) {
        return {};
    }
};

export const addTeachersToStudent = async (
    student: { _id: string; teachers: any },
    teachers: any
) => {
    if (Object.keys(teachers).length == 0) return false;
    return isPatchSuccess(
        await editDocs("students", [
            {
                _id: student._id,
                patch: [
                    {
                        op: "REPLACE",
                        path: "/teachers",
                        value: { ...student.teachers, ...teachers },
                    },
                ],
            },
        ])
    );
};

export const setStudentTeachers = async (
    student: { _id: string; teachers: {} },
    teachers: {}
) => {
    return isPatchSuccess(
        await editDocs("students", [
            {
                _id: student._id,
                patch: [
                    {
                        op: "REPLACE",
                        path: "/teachers",
                        value: teachers,
                    },
                ],
            },
        ])
    );
};

export const deleteStudentTeachers = async (
    student: { _id: string; teachers: any },
    teachers: {}
) => {
    for (let i in teachers) {
        delete student.teachers[i];
    }
    return await setStudentTeachers(student, teachers);
};

export const canEditSlot = (
    student: { email: string },
    slot: { student_email?: string }
) => {
    return slot.student_email == student.email || !slot.student_email;
};

export const deleteStudent = (studentData: any) => {
    rmDocs("students", [studentData]);
};

export const getStudent = (email: string) => {
    return new Promise<QueryResponse>((resolve, reject) => {
        query(
            {
                query: `select * from \"office-hours\".students where email=:email`,
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
