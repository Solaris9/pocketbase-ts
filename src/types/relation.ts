import { Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";
import { select } from "../utils";

type RelationOptions = {
    maxSelect: number;
    collectionId: string;
    cascadeDelete: boolean;
};

export type RelationField = SchemaField & {
    type: "relation";
    options: Partial<RelationOptions>;
};

type RelationTypeOptions = Partial<UniqueField & RelationOptions>;

type RelationType = {
    (options?: OptionalField & RelationTypeOptions): Optional<RelationField>;
    (options?: RequiredField & RelationTypeOptions): RelationField;
}

export const relationField: RelationType = options => {
    const data = {
        type: "relation",
        required: options?.required ?? false
    } as RelationField;

    if (options) data.options = select(options, ["maxSelect", "collectionId", "cascadeDelete"]);

    return data as any;
}