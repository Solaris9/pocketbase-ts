import { Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";

export type JSONField = SchemaField & {
    type: "json";
};

type JSONType = {
    (options?: OptionalField & UniqueField): Optional<JSONField>;
    (options?: RequiredField & UniqueField): JSONField;
}

export const jsonField: JSONType = options => {
    const data = {
        type: "json",
        required: options?.required ?? false
    } as JSONField;

    return data as any;
}
