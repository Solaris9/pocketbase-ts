import { Optional, OptionalField, RequiredField, SchemaField, UniqueField } from ".";
import { select } from "../utils";

type FileOptions = {
    maxSelect: number;
    maxSize: number;
    mimeTypes: string[];
    thumbs: `${number}x${number}`[];
}

export type FileField = SchemaField & {
    type: "file";
    options: Partial<FileOptions>;
};

type FileTypeOptions = Partial<UniqueField & FileOptions>;

type FileType = {
    (options?: OptionalField & FileTypeOptions): Optional<FileField>;
    (options?: RequiredField & FileTypeOptions): FileField;
}

export const fileField: FileType = options => {
    const data = {
        type: "file",
        required: options?.required ?? false
    } as FileField;

    if (options) data.options = select(options, ["maxSelect", "maxSize", "mimeTypes", "thumbs"]);

    return data as any;
}