import { BaseDocument, Collection, ExtractCollectionGeneric } from "./collection";
import { Field, GetType, Optional } from "./types";

export type SchemaField = {
    id: string;
    name: string;
    type: string;
    required: boolean;
    system: boolean;
    options: Record<string, any>;
};

export type ExtractSchemaGeneric<T extends Schema<unknown>> = T extends Schema<infer X> ? X : never
export type ExtractOptionalGeneric<T> = T extends Optional<infer X> ? X : never;

export type SimplifyFieldType<T> =
    T extends Optional<Field<infer X,unknown>> ? Optional<X> :
    T extends Field<infer X, unknown> ? X : T;

export type RemoveOptional<T> = { [P in keyof T as T[P] extends Optional<unknown> ? never : P]: T[P] };
export type RemoveRequired<T> = { [P in keyof T as T[P] extends Optional<unknown> ? P : never]: T[P] };

export type NormalizeDocument<T, B> = T & { [K in keyof B as K extends keyof T ? never : K]: B[K] };

export type SimplifyDocument<T> =
    { [K in keyof RemoveOptional<T>]: GetType<SimplifyFieldType<T[K]>> } &
    { [K in keyof RemoveRequired<T>]?: GetType<ExtractOptionalGeneric<SimplifyFieldType<T[K]>>> };

export type Document<T, R extends string = "", E = BaseDocument> =
    Omit<NormalizeDocument<SimplifyDocument<T>, E>, R>;

export type ExtractDocument<T extends Collection<unknown>> = Document<ExtractCollectionGeneric<T>>;

type SchemaValidationType = "missing";
type SchemaValidationResult = null | {
    key: string;
    type: SchemaValidationType;
    message: string;
    expected?: unknown;
    received?: unknown;
}[];

export class Schema<T> {
    public definition: T;

    constructor(definition: T) {
        this.definition = definition;
    }

    validate(data: Document<T, "id" | "created" | "updated">): SchemaValidationResult {
        const definition = this.definition as Record<string, SchemaField>;
        const schemaKeys = Object.keys(definition);

        const requiredKeys = schemaKeys.filter(k => definition[k].required);
        const dataKeys = Object.keys(data);

        if (!requiredKeys.every(k => dataKeys.includes(k))) {
            const missing = requiredKeys.filter(k => !dataKeys.includes(k));
            return missing.map(m => ({
                type: "missing",
                key: m,
                message: `Missing required property '${m}'.`
            }));
        }

        // continue type check implementation

        return null;
    }
}

// const getType = <T extends Field<string, unknown>>(field: T) => {
//     if (["text", "url", "date", "email"].includes(field.type)) return "string";
//     else if (["file", "relation", "select"].includes(field.type)) return "string[]";
//     else if (field.type == "number") return "number";
//     else if (field.type == "bool") return "boolean";
//     else if (field.type == "json") return "json";
        
//     return null as never;
// }

// const UserSchema = new Schema({
//     title: Type.text({ required: true }),
//     description: Type.text(),
// });

// const res = UserSchema.validate({
    
// })