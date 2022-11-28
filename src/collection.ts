import { ExtractCollectionGeneric, pocketBaseURL, Resource } from "./client";
import { Document, Schema, SchemaDefinition } from "./model";
import { SchemaField } from "./types";
import { request, RequestData } from "./utils";
import type { SetRequired } from "type-fest";

//#region collection

export type BaseDoc = {
    id: string;
    created: string;
    updated: string;
};

export type Collection<T> = Resource & {
    identifier?: string;
    definition?: {
        name: string;
        type: "base" | string;
        schema: SchemaField[];
    };
}

export const collection = <T>(identifier: string, schema: SchemaDefinition<T>): SetRequired<Collection<Document<Schema<T>>>, "definition"> => {
    let definition = { name: identifier, type: "base", schema: schema.fields };
    
    const collection = {
        path: `/api/collections/${identifier}/records`,
        definition,
        identifier
    }

    return collection;
}

//#endregion

//#region get

export const get = async <T extends Resource>(resource: T, id: string): Promise<ExtractCollectionGeneric<T>> => {
    if (!pocketBaseURL) throw new Error("init has not been called");
    return await request<ExtractCollectionGeneric<T>>(`${resource.path}/${id}`, {});
}

//#endregion

//#region create

type Create = {
    /** Create record using a object literal. Cannot upload files. */
    <T>(collection: Collection<T>, data: Record<string, any>): Promise<Document<T & BaseDoc>>;
    /** Create record using a object literal. Cannot upload files. */
    <T>(collection: Collection<T>, data: Document<T & BaseDoc>): Promise<Document<T & BaseDoc>>;
    /** Create record using a FormData to upload files. */
    <T>(collection: Collection<T>, data: FormData): Promise<Document<T & BaseDoc>>;
}

export const create: Create = async(collection, data) => {
    if (!pocketBaseURL) throw new Error("init has not been called");

    const options: RequestData = { };

    if (data.constructor == FormData) options.form = data;
    else options.body = data;

    return await request(collection.path, options, "POST");
}

//#endregion

//#region update

type Update = {
    /** Create record using a FormData to upload files. */
    <T>(collection: Collection<T>, id: string, data: FormData): Promise<Document<T & BaseDoc>>;
    /** Create record using a object literal. Cannot upload files. */
    <T>(collection: Collection<T>, id: string, data: Document<T & BaseDoc>): Promise<Document<T & BaseDoc>>;
}

export const update: Update = async(collection, id, data) => {
    if (!pocketBaseURL) throw new Error("init has not been called");

    const options: RequestData = { };

    if (data.constructor == FormData) options.form = data;
    else options.body = data;

    return await request(`${collection.path}/${id}`, options, "POST");
}

//#endregion

//#region delete

export const del = async <T>(collection: Collection<T>, id: string): Promise<any> => {
    if (!pocketBaseURL) throw new Error("init has not been called");
    return await request(`${collection.path}/${id}`, {}, "DELETE");
}

//#endregion

//#region list

type ListShared = {
    page: number;
    perPage: number;
}

type ListOptions = Partial<ListShared & {
    sort?: string;
    filter?: string;
}>;

type ListResult<T> = ListShared & {
    totalItems: number;
    totalPages: number;
    items: T[];
}

export const list = async <T extends Resource>(resource: T, options?: ListOptions): Promise<ListResult<ExtractCollectionGeneric<T>>> => {
    if (!pocketBaseURL) throw new Error("init has not been called");
    return await request(resource.path, { params: options });
}

//#endregion

// const Operators = ["=", "!=", ">", ">=", "<", "<=", "~", "!~"] as const;
// type Operators = typeof Operators[number];
// const where = <T>(key: keyof T, operator: Operators, value: string) => `${String(key)}${operator}${value}`;
