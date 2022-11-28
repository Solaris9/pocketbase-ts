import { omit } from "./utils";

export type ExtraField = { unique: boolean; system: boolean };
export type RequiredField = { required: true };
export type OptionalField = { required?: false };

// TODO: FIX THIS MESS BECAUSE I DON'T KNOW ENOUGH ABOUT TYPESCRIPT
// export type Optional<T> = T;
export type Optional<T> = { _?: T };

export type SchemaField = {
    id: string;
    title: string;
    type: string;
    required: boolean;
    system: boolean;
    options: Record<string, any>;
};

type GetType<T> =
    T extends "text" | "url" | "date" | "email" ? string :
    T extends "file" | "relation" | "select" ? string[] :
    T extends "number" ? number :
    T extends "bool" ? boolean :
    T extends "json" ? any :
    never;

export type SchemaFieldType<T> = T extends Optional<infer X> ? Optional<GetType<X>> : GetType<T>;

export type Field<T, R> = { type: T };

type FieldType<O, T, R> = {
    (options?: OptionalField & Partial<ExtraField & O>): Optional<Field<T, R>>;
    (options?: RequiredField & Partial<ExtraField & O>): Field<T, R>;
}

const field = <O, R, T>(type: T): FieldType<O, T, R> => (options) => ({
    type,
    required: !!options?.required,
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

export const Type = {
    bool: field<{}, boolean, "bool">("bool"),
    date: field<MinMax, string, "date">("date"),
    email: field<Domains, string, "email">("email"),
    file: field<FileOptions, string, "file">("file"),
    json: field<{}, string, "json">("json"),
    number: field<MinMax, number, "number">("number"),
    relation: field<RelationOptions, string, "relation">("relation"),
    select: field<SelectOptions, string[], "select">("select"),
    text: field<TextOptions, string, "text">("text"),
    url: field<Domains, string, "url">("url"),
};