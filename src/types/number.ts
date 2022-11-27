import { MinMax, Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";
import { select } from "../utils";

export type NumberField = SchemaField & {
    type: "number";
    options: Partial<MinMax>;
};

type NumberTypeOptions = Partial<UniqueField & MinMax>;

type NumberType = {
    (options?: OptionalField & NumberTypeOptions): Optional<NumberField>;
    (options?: RequiredField & NumberTypeOptions): NumberField;
}

export const numberField: NumberType = options => {
    const data = {
        type: "number",
        required: options?.required ?? false
    } as NumberField;

    if (options) data.options = select(options, ["max", "min"]);

    return data as any;
}
