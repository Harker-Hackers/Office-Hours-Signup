import rockset from "@rockset/client";
import {
    AddDocumentsResponse,
    DeleteDocumentsResponse,
    PatchDocumentsResponse,
    QueryRequestSql,
    QueryResponse,
} from "@rockset/client/dist/codegen/api";
import { QueryCallback } from "./types";

const client = rockset(require("./config.json").rocksetApiKey);


export function isPatchSuccess (r:PatchDocumentsResponse) {
    return r.data != undefined && !r.data[0].error;
};
export function isQuerySuccess(r:QueryResponse) {
    return !!r.results
    
}


export const addDocs = (
    collection: "slots" | "students" | "teachers",
    documents: any[]
) => {
    return new Promise<AddDocumentsResponse>((resolve, reject) => {
        client.documents
            .addDocuments("office-hours", collection, { data: documents })
            .then(resolve)
            .catch(console.log);
    });
};
export const rmDocs = (
    collection: "slots" | "students" | "teachers",
    documents: any[]
) => {
    return new Promise<DeleteDocumentsResponse>((resolve, reject) => {
        client.documents
            .deleteDocuments("office-hours", collection, { data: documents })
            .then(resolve)
            .catch(console.log);
    });
};
export const editDocs = (
    collection: "slots" | "students" | "teachers",
    documents: any[]
) => {
    return new Promise<PatchDocumentsResponse>((resolve, reject) => {
        client.documents
            .patchDocuments("office-hours", collection, { data: documents })
            .then(resolve)
            .catch(console.log);
    });
};
export const query = (queryBody: QueryRequestSql, callback: QueryCallback) => {
    client.queries.query({ sql: queryBody }).then(callback).catch(console.log);
};
