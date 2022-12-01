import { pocketBaseURL, Resource } from "./client";
import { Document, ExtractSchemaGeneric, Schema } from "./schema";
import { Optional } from "./types";
import { request, RequestData } from "./utils";

//#region collection

export type ExtractCollectionGeneric<T extends Collection<unknown>> = T extends Collection<infer X> ? X : never

export type MakeOptional<T> = T extends Optional<unknown> ? T : Optional<T>;
export type MakeAllOptional<T> = { [K in keyof T]: MakeOptional<T[K]> };

export type MakeRequired<T> = T extends Optional<infer X> ? X : T
export type MakeAllRequired<T> = { [K in keyof T]: MakeRequired<T> };

export type SetRequired<T, K extends keyof T> = Omit<T, K> & { [P in K]: MakeRequired<T[K]> }
export type SetOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]: MakeOptional<T[K]> }

export type BaseDocument = {
    id: string;
    created: string;
    updated: string;
};

export type CollectionType = "base" | "auth";

export class Collection<T> implements Resource {
    path: string;
    schema: T;
    identifier?: string;
    type?: string;

    constructor(path: string, schema: T, identifier?: string, type: CollectionType = "base") {
        this.path = path;
        this.schema = schema;
        this.identifier = identifier;
        this.type = type;
    }
};

export const collection = <T extends Schema<unknown>>(identifier: string, schema: T, type: CollectionType = "base"): Collection<T> =>
    new Collection<T>(`/api/collections/${identifier}/records`, schema, identifier, type);

//#endregion

//#region list

type ListShared = {
    page: number;
    perPage: number;
};

type ListOptions = Partial<ListShared & {
    sort?: string;
    filter?: string;
}>;

type ListResult<T> = ListShared & {
    totalItems: number;
    totalPages: number;
    items: T[];
};

export const list = async <T extends Collection<Schema<unknown>>>(
    collection: T,
    options?: ListOptions
): Promise<ListResult<Document<ExtractSchemaGeneric<T["schema"]>>>> => {
    if (!pocketBaseURL) throw new Error("init has not been called");
    return await request(collection.path, { params: options });
};

//#endregion

//#region get

export const get = async <T extends Collection<Schema<unknown>>>(
    collection: T,
    id: string
): Promise<Document<ExtractSchemaGeneric<T["schema"]>>> => {
    if (!pocketBaseURL) throw new Error("init has not been called");
    return await request(`${collection.path}/${id}`, {});
}

//#endregion

//#region find

export const find = async <T extends Collection<Schema<unknown>>>(
    collection: T,
    options: Omit<ListOptions, "page" | "perPage">
): Promise<Document<ExtractSchemaGeneric<T["schema"]>>> => {
    if (!pocketBaseURL) throw new Error("init has not been called");
    const results = await list(collection, options);
    return results.items[0];
}

//#endregion

//#region create

type Create = {
    /** Create record using the schema definition. Cannot upload files. */
    <T extends Collection<Schema<unknown>>>(
        collection: T,
        data: Document<ExtractSchemaGeneric<T["schema"]>, "updated" | "created">
    ): Promise<Document<ExtractSchemaGeneric<T["schema"]>>>;
    /** Create record using a FormData to upload files. */
    <T extends Collection<Schema<unknown>>>(
        collection: T,
        data: FormData
    ): Promise<Document<ExtractSchemaGeneric<T["schema"]>>>;
};

export const create: Create = async(collection, data) => {
    if (!pocketBaseURL) throw new Error("init has not been called");
    
    const options: RequestData = {};

    // if (collection.constructor == Collection && data.constructor == Collection) {
    //     const fields: SchemaField[] = Object.keys(collection.schema).map(k => ({
    //         ...(data as Record<any, any>)[k],
    //         name: k,
    //     }));
    
    //     options.body = {
    //         name: data.identifier,
    //         type: "base",
    //         schema: fields,
    //     }
    // } else
    if (data.constructor == FormData) {
        options.form = data;
    } else {
        options.body = data;
    }

    return await request(collection.path, options, "POST");
}

//#endregion

//#region update

type Update = {
    /** Create record using a FormData to upload files. */
    <T extends Collection<Schema<unknown>>>(
        collection: T,
        id: string,
        data: FormData
    ): Promise<Document<ExtractSchemaGeneric<T["schema"]>>>;
    /** Create record using a object literal. Cannot upload files. */
    <T extends Collection<Schema<unknown>>>(
        collection: T,
        id: string,
        data: Partial<Document<ExtractSchemaGeneric<T["schema"]>, "created" | "updated" | "id">>
    ): Promise<Document<ExtractSchemaGeneric<T["schema"]>>>;
};

export const update: Update = async (collection, id, data) => {
    if (!pocketBaseURL) throw new Error("init has not been called");

    const options: RequestData = {};

    if (data.constructor == FormData) options.form = data;
    else options.body = data;

    return await request(`${collection.path}/${id}`, options, "PATCH");
};

//#endregion

//#region delete

export const del = async <T extends Collection<unknown>>(collection: T, id: string): Promise<never> => {
    if (!pocketBaseURL) throw new Error("init has not been called");
    return await request(`${collection.path}/${id}`, {}, "DELETE");
};

//#endregion

// const Operators = ["=", "!=", ">", ">=", "<", "<=", "~", "!~"] as const;
// type Operators = typeof Operators[number];
// const where = <T>(key: keyof T, operator: Operators, value: string) => `${String(key)}${operator}${value}`;
