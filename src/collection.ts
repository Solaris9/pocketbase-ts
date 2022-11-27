import { authStore } from "./auth";
import { pocketBaseURL } from "./client";
import { Document, Schema, SchemaDefinition } from "./model";
import { SchemaField } from "./types";
import { request, RequestData } from "./utils";

export type BaseDoc = {
    id: string;
    created: string;
    updated: string;
};

export type Doc<T> = T & BaseDoc;

export type Collection<T> = {
    identifier: string;
    definition: {
        name: string;
        type: "base" | string;
        schema: SchemaField[];
    } | null;
};

export const collection = <T>(identifier: string, schema?: SchemaDefinition<T>): Collection<Schema<T>> => {
    if (!pocketBaseURL) throw new Error("init has not been called");
    let definition: Collection<T>["definition"] | null = null;
    if (schema) definition = { name: identifier, type: "base", schema: schema.fields };
    return { identifier, definition };
};

export const get = async <T>(collection: Collection<T>, id: string, expand?: string): Promise<Document<T & BaseDoc>> => {
    if (!pocketBaseURL) throw new Error("init has not been called");

    const path = `collections/${collection.identifier}/records/${id}`;
    const res = await request(path, { params: { expand } });
    const json = await res.json();
    
    delete json["collectionId"];
    delete json["collectionName"];

    return json;
}

export const create = async <T>(collection: Collection<T>, data: Document<T & BaseDoc>): Promise<Document<T & BaseDoc>> => {
    if (!pocketBaseURL) throw new Error("init has not been called");

    const options: RequestData = { };

    // if (data.constructor == FormData) options.form = data;
    // else
        options.body = data;

    const path = `collections/${collection.identifier}/records`;
    const res = await request(path, options, "POST");
    const json = await res.json();
    
    return json;
}

export const del = async <T>(collection: Collection<T>, id: string): Promise<any> => {
    if (!pocketBaseURL) throw new Error("init has not been called");

    const path = `collections/${collection.identifier}/records/${id}`;
    const res = await request(path, {}, "DELETE");
    const json = await res.json();

    return json;
}

type ListOptions = {
    page?: number;
    perPage?: number;
    sort?: string;
    filter?: string;
};

type ListResult<T> = {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: T[];
}

export const list = async <T>(collection: Collection<T>, options?: ListOptions): Promise<ListResult<Document<T & BaseDoc>>> => {
    if (!pocketBaseURL) throw new Error("init has not been called");

    const path = `collections/${collection.identifier}/records/`;
    const res = await request(path, { params: options });
    const json = await res.json();
    
    return json;
}

// const Operators = ["=", "!=", ">", ">=", "<", "<=", "~", "!~"] as const;
// type Operators = typeof Operators[number];
// const where = <T>(key: keyof T, operator: Operators, value: string) => `${String(key)}${operator}${value}`;
