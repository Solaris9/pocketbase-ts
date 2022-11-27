import { Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";
import { select } from "../utils";

type SelectOptions = {
    maxSelect: number;
    choices: string[];
};

export type SelectField = SchemaField & {
    type: "select";
    options: Partial<SelectOptions>;
};

type SelectTypeOptions = Partial<UniqueField & SelectOptions>;

type SelectType = {
    (options?: OptionalField & SelectTypeOptions): Optional<SelectField>;
    (options?: RequiredField & SelectTypeOptions): SelectField;
}

export const selectField: SelectType = options => {
    const data = {
        type: "select",
        required: options?.required ?? false
    } as SelectField;

    if (options) data.options = select(options, ["maxSelect", "choices"]);

    return data as any;
}