import { Domains, Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";
import { select } from "../utils";

export type UrlField = SchemaField & {
    type: "url";
    options: Partial<Domains>;
};

type UrlTypeOptions = Partial<UniqueField & Domains>;

type UrlType = {
    (options?: OptionalField & UrlTypeOptions): Optional<UrlField>;
    (options?: RequiredField & UrlTypeOptions): UrlField;
}

export const urlField: UrlType = options => {
    const data = {
        type: "url",
        required: options?.required ?? false
    } as UrlField;

    if (options) data.options = select(options, ["onlyDomains", "exceptDomains"]);

    return data as any;
}
