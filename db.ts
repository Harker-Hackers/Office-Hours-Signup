import rockset, {  } from "@rockset/client";
import { QueryRequestSql } from "@rockset/client/dist/codegen/api";
import { QueryCallback } from "./types";

const client = rockset(require("./config.json").rocksetApiKey);

export const addDocs = (collection: "slots" | "students" | "teachers", documents: any[]) => {
    client.documents.addDocuments("office-hours", collection, { data: documents }).catch(console.log);
};
export const rmDocs = (collection: "slots" | "students" | "teachers", documents: any[]) => {
    client.documents.deleteDocuments("office-hours", collection, { data: documents }).catch(console.log);
}
export const query = (queryBody: QueryRequestSql, callback: QueryCallback) => {
    client.queries.query({ sql: queryBody }).then(callback).catch(console.log);
};