import { Request, Response } from "express";
import { QueryResponse } from "@rockset/client/dist/codegen/api";

export interface googleUser {
    iss: string,
    aud: string,
    sub: string,
    email?: string,
    email_verified?: boolean,
    azp?: string,
    name?: string,
    picture?: string,
    given_name?: string,
    family_name?: string,
}

export type QueryCallback = (value: QueryResponse) => void
export type Req = Request<{}, any, any, Record<string, any>>;
export type Res = Response<any, Record<string, any>>;