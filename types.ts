import { QueryResponse } from "@rockset/client/dist/codegen/api";
import { Request, Response } from "express";

export interface googleUser {
    iss: string;
    aud: string;
    sub: string;
    email?: string;
    email_verified?: boolean;
    azp?: string;
    name?: string;
    picture?: string;
    given_name?: string; // snake case because of API
    family_name?: string;
}

export interface User {
    _id: number;
    email: string;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    _event_time: string;
    role?: string;
}

export interface Teacher extends User {
    teacher: any;
    slots: Slot[];
    role?: string;
}

export interface Student extends User {
    slots: Slot[];
    teacher: false;
    teachers: string[];
    teacher_slots: Slot[];
    role?: string;
}

export interface DatabaseItem {
    _id: string;
    _event_time: string;
}

export interface Slot extends DatabaseItem {
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    teacher_id: string;
    student_email: string;
}

export interface Email {
    to: string;
    from: string;
    subject: string;
    text: string;
    html?: string;
    cc?: string;
    bcc?: string;
    attachments?: any;
}

export type QueryCallback = (value: QueryResponse) => void;
export type Req = Request<{}, any, any, Record<string, any>>;
export type Res = Response<any, Record<string, any>>;