import { Domains, Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";
import { select } from "../utils";

export type EmailField = SchemaField & {
    type: "email";
    options: Partial<Domains>;
};

type EmailOptions = Partial<UniqueField & Domains>;

type EmailType = {
    (options?: OptionalField & EmailOptions): Optional<EmailField>;
    (options?: RequiredField & EmailOptions): EmailField;
}

export const emailField: EmailType = options => {
    const data = {
        type: "email",
        required: options?.required ?? false
    } as EmailField;

    if (options) data.options = select(options, ["onlyDomains", "exceptDomains"]);

    return data as any;
}
