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