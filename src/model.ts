import { BaseDoc } from "./collection";
import { Field, Optional, SchemaField, SchemaFieldType } from "./types";

type ExtractTypeGeneric<T> =
    T extends Optional<Field<infer X, any>> ? Optional<X> : 
    T extends Field<infer X, any> ? X : never

export type Schema<T> = {
    [K in keyof T]: SchemaFieldType<ExtractTypeGeneric<T[K]>>
};

export type SchemaFieldDefinition = { name: string } & SchemaField;

export type SchemaDefinition<T> = {
    fields: SchemaFieldDefinition[];
    obj: T & BaseDoc;
}

export type RemoveOptional<T> = { [P in keyof T as T[P] extends Optional<unknown> ? never : P]: T[P] };
export type RemoveRequired<T> = { [P in keyof T as T[P] extends Optional<unknown> ? P : never]: T[P] };

export type ExtractGeneric<T> = T extends Optional<infer X> ? X : never

export type Document<T> = { [K in keyof RemoveOptional<T>]: T[K] } & { [K in keyof RemoveRequired<T>]?: ExtractGeneric<T[K]> }
export type ExtractDoc<T extends SchemaDefinition<any>> = Document<Schema<T["obj"]>>

export const schema = <T extends { [key: string]: any }>(obj: T & Partial<BaseDoc>): SchemaDefinition<T & BaseDoc> => {
    const fields = Object.keys(obj).map(k => ({ name: k, ...obj[k] }));
    return { fields, obj: obj as T & BaseDoc };
}