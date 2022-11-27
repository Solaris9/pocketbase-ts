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

export type SchemaFieldType<T> =
    T extends Optional<"bool"> ? Optional<boolean> :
    T extends Optional<"date"> ? Optional<string> :
    T extends Optional<"email"> ? Optional<string> :
    T extends Optional<"file"> ? Optional<string[]> :
    T extends Optional<"json"> ? Optional<any> :
    T extends Optional<"number"> ? Optional<number> :
    T extends Optional<"relation"> ? Optional<string[]> :
    T extends Optional<"select"> ? Optional<string[]> :
    T extends Optional<"text"> ? Optional<string> :
    T extends Optional<"url"> ? Optional<string> :
    T extends "bool" ? boolean :
    T extends "date" ? string :
    T extends "email" ? string :
    T extends "file" ? string[] :
    T extends "json" ? any :
    T extends "number" ? number :
    T extends "relation" ? string[] :
    T extends "select" ? string[] :
    T extends "text" ? string :
    T extends "url" ? string :
    never;

export type Field<T, R> = {
    type: T;
}

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