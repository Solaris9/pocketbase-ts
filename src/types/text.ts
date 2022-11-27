import { Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";
import { select } from "../utils";

type TextOptions = {
    min: number;
    max: number;
    regex: RegExp;
};

export type TextField = SchemaField & {
    type: "text";
    options: Partial<TextOptions>;
};

type TextTypeOptions = Partial<UniqueField & TextOptions>;

type TextType = {
    (options?: OptionalField & TextTypeOptions): Optional<TextField>;
    (options?: RequiredField & TextTypeOptions): TextField;
}

export const textField: TextType = options => {
    const data = {
        type: "text",
        required: options?.required ?? false
    } as TextField;

    if (options) data.options = select(options, ["max", "min", "regex"]);

    return data as any;
}
