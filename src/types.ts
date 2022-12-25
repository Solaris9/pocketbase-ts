import { SchemaField } from "./schema";
import { omit } from "./utils";

export type ExtraField = { unique: boolean; system: boolean };
export type RequiredField = { required: true };
export type OptionalField = { required?: false };

// TODO: FIX THIS MESS BECAUSE I DON'T KNOW ENOUGH ABOUT TYPESCRIPT
// export type Optional<T> = T;
export type Optional<T> = { _?: T };

export type GetType<T> =
    T extends "text" | "url" | "date" | "email" ? string :
    T extends "file" | "relation" | "select" ? string[] :
    T extends "number" ? number :
    T extends "bool" ? boolean :
    T extends "json" ? any :
    never;

export type SchemaFieldType<T> = T extends Optional<infer X> ? Optional<GetType<X>> : GetType<T>;

// TODO: fix again because i have no idea how to make this actually work without weird hacks like this
export type Field<T> = SchemaField & { __?: T, validate: (value: unknown) => boolean };

type FieldType<O, T> = {
    (options?: OptionalField & Partial<ExtraField & O>): Optional<Field<T>>;
    (options?: RequiredField & Partial<ExtraField & O>): Field<T>;
}

const field = <O, T>(type: T, validate: (value: unknown) => boolean): FieldType<O, T> => (options) => ({
    type,
    validate,
    required: !!options?.required,
    system: !!options?.system,
    unique: !!options?.unique,
    options: omit(options!, ["required", "unique", "system"])
}) as any;

type MinMax = { min: number; max: number };
type Domains = { exceptDomains: string[]; onlyDomains: string[] };

type Select = { maxSelect: number };
type TextOptions = MinMax & { regex: RegExp };
type SelectOptions = Select & { choices: string[] };
type FileOptions = Select & { maxSize: number; mimeTypes: string[]; thumbs: `${number}x${number}`[] };
type RelationOptions = Select & { collectionId: string; cascadeDelete: boolean; };

const isStringArray = (v: unknown) => Array.isArray(v) && v.every(i => typeof i == "string");

export const Type = {
    bool: field<{}, "bool">("bool", v => Boolean(v)),
    date: field<MinMax, "date">("date", v => isFinite(+(new Date(v as any)))),
    email: field<Domains, "email">("email", v => /.+@.=\..+/.test(v as string)),
    file: field<FileOptions, "file">("file",  isStringArray),
    json: field<{}, "json">("json", () => true),
    number: field<MinMax, "number">("number", v => typeof v == "number"),
    relation: field<RelationOptions, "relation">("relation", isStringArray),
    select: field<SelectOptions, "select">("select", isStringArray),
    text: field<TextOptions, "text">("text", v => typeof v == "string"),
    url: field<Domains, "url">("url", v => {
        try {
            new URL(v as any);
            return true;
        } catch {
            return false;
        }
    }),
};