import { Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";

export type BoolField = SchemaField & {
    type: "bool";
};

type BoolType = {
    (options?: OptionalField & UniqueField): Optional<BoolField>;
    (options?: RequiredField & UniqueField): BoolField;
}

export const boolField: BoolType = options => {
    return {
        type: "bool",
        required: options?.required ?? false
    } as BoolField as any;
}
