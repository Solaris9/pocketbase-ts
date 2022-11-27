import { MinMax, Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";
import { select } from "../utils";

export type DateField = SchemaField & {
    type: "date";
    options: Partial<MinMax>;
};

type DateTypeOptions = Partial<UniqueField & MinMax>;

type DateType = {
    (options?: OptionalField & DateTypeOptions): Optional<DateField>;
    (options?: RequiredField & DateTypeOptions): DateField;
}

export const dateField: DateType = options => {
    const data = {
        type: "date",
        required: options?.required ?? false
    } as DateField;

    if (options) data.options = select(options, ["max", "min"]);

    return data as any;
}
