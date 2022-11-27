import { BoolField, boolField } from "./bool";
import { DateField, dateField } from "./date";
import { EmailField, emailField } from "./email";
import { FileField, fileField } from "./file";
import { JSONField, jsonField } from "./json";
import { NumberField, numberField } from "./number";
import { RelationField, relationField } from "./relation";
import { SelectField, selectField } from "./select";
import { TextField, textField } from "./text";
import { UrlField, urlField } from "./url";

export type MinMax = {
    min: number;
    max: number;
};

export type Domains = {
    exceptDomains: string[];
    onlyDomains: string[];
};

export type UniqueField = { unique: boolean };
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
    T extends Optional<BoolField> ? Optional<boolean> :
    T extends Optional<DateField> ? Optional<string> :
    T extends Optional<EmailField> ? Optional<string> :
    T extends Optional<FileField> ? Optional<string[]> :
    T extends Optional<JSONField> ? Optional<any> :
    T extends Optional<NumberField> ? Optional<number> :
    T extends Optional<RelationField> ? Optional<string[]> :
    T extends Optional<SelectField> ? Optional<string[]> :
    T extends Optional<TextField> ? Optional<string> :
    T extends Optional<UrlField> ? Optional<string> :
    T extends BoolField ? boolean :
    T extends DateField ? string :
    T extends EmailField ? string :
    T extends FileField ? string[] :
    T extends JSONField ? any :
    T extends NumberField ? number :
    T extends RelationField ? string[] :
    T extends SelectField ? string[] :
    T extends TextField ? string :
    T extends UrlField ? string :
    never;

export const Type = {
    bool: boolField,
    date: dateField,
    email: emailField,
    file: fileField,
    json: jsonField,
    number: numberField,
    relation: relationField,
    select: selectField,
    text: textField,
    url: urlField
}