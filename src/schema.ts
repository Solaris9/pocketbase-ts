import { Collection, type BaseDocument, type ExtractCollectionGeneric } from "./collection";
import type { Field, GetType, Optional } from "./types";

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

export type RemoveOptional<T> = { [P in keyof T as T[P] extends Optional<unknown> ? never : P]: T[P] };
export type RemoveRequired<T> = { [P in keyof T as T[P] extends Optional<unknown> ? P : never]: T[P] };

export type NormalizeDocument<T, B> = T & { [K in keyof B as K extends keyof T ? never : K]: B[K] };

export type SimplifyDocument<T> =
    { [K in keyof RemoveOptional<T>]: T[K] extends Field<infer X> ? GetType<X> : never } &
    { [K in keyof RemoveRequired<T>]?: T[K] extends Optional<Field<infer X>> ? GetType<X> : never };

export type Document<T, R extends string = "", O extends string = "", E = BaseDocument> =
     Omit<NormalizeDocument<SimplifyDocument<T>, E>, R | O> &
     { [K in keyof E as K extends O ? K : never]?: E[K] };

export type ExtractDocument<T extends Collection<unknown>> = Document<ExtractCollectionGeneric<T>>;

type SchemaValidationType = "missing" | "failed";
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
        const definition = this.definition as Record<string, Field<unknown>>;
        const schemaKeys = Object.keys(definition);

        const requiredKeys = schemaKeys.filter(k => definition[k].required);
        const dataKeys = Object.keys(data);

        if (requiredKeys.every(k => !dataKeys.includes(k))) {
            const missing = requiredKeys.filter(k => !dataKeys.includes(k));
            return missing.map(m => ({
                type: "missing",
                key: m,
                message: `Missing required property '${m}'.`
            }));
        }

        const errors: SchemaValidationResult = [];

        for (let key in definition) {
            const field = definition[key];
            const value = (data as Record<string, unknown>)[key];
            if (!field.required && typeof value == "undefined") continue;

            if (!field.validate(value)) errors.push({
                key,
                type: "failed",
                message: `Field is not of type '${field.type}'.`,
                expected: field.type,
                // TODO: transform typeof to pocketbase types, e.g. text, bool, select
                received: typeof value,
            });
        }

        if (errors.length) return errors;

        return null;
    }
}