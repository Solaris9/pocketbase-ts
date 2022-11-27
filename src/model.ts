import { BaseDoc } from "./collection";
import { Optional, SchemaField, SchemaFieldType } from "./types";

export type Schema<T> = {
    [K in keyof T]: SchemaFieldType<T[K]>
};

export type SchemaFieldDefinition = { name: string } & SchemaField;

export type SchemaDefinition<T> = {
    fields: SchemaFieldDefinition[];
    obj: T & BaseDoc;
}

type ExtractGeneric<T> = T extends Optional<infer X> ? X : never

type RemoveOptional<T> = { [P in keyof T as T[P] extends Optional<unknown> ? never : P]: T[P] };
type RemoveRequired<T> = { [P in keyof T as T[P] extends Optional<unknown> ? P : never]: T[P] };

export type Document<T> = { [K in keyof RemoveOptional<T>]: T[K] } & { [K in keyof RemoveRequired<T>]?: ExtractGeneric<T[K]> }
export type ExtractDoc<T extends SchemaDefinition<any>> = Document<Schema<T["obj"]>>

export const schema = <T extends { [key: string]: any }>(obj: T & Partial<BaseDoc>): SchemaDefinition<T & BaseDoc> => {
    const fields = Object.keys(obj).map(k => ({ name: k, ...obj[k] }));
    return { fields, obj: obj as T & BaseDoc };
}