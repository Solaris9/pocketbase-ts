import { Collection } from "./collection";
import { Schema } from "./schema";
import { Type } from "./types";

export let pocketBaseURL: string | null = null;
export const init = (url: string) => pocketBaseURL = url;

export abstract class Resource {
    abstract path: string;
};

export const UserSchema = new Schema({
    username: Type.text(),
    email: Type.text(),
    emailVisibility: Type.bool(),
    password: Type.text({ required: true }),
    passwordConfirm: Type.text({ required: true }),
    verified: Type.bool(),
});

export const Users = new Collection("/api/collections/users/records", UserSchema);

export const CollectionSchema = new Schema({
    name: Type.text({ required: true }),
    type: Type.text({ required: true }),
    schema: Type.json({ required: true }),
    system: Type.bool(),
    listRule: Type.text(),
    viewRule: Type.text(),
    createRule: Type.text(),
    updateRule: Type.text(),
    deleteRule: Type.text(),
    // auth
    manageRule: Type.text(),
    allowOAuth2Auth: Type.text(),
    allowUsernameAuth: Type.text(),
    allowEmailAuth: Type.text(),
    requireEmail: Type.text(),
    exceptEmailDomains: Type.text(),
    onlyEmailDomains: Type.text(),
    minPasswordLength: Type.text(),
});

export const Collections = new Collection("/api/collections", CollectionSchema);

export const AdminSchema = new Schema({
    username: Type.text(),
    email: Type.text(),
    emailVisibility: Type.bool(),
    password: Type.text({ required: true }),
    passwordConfirm: Type.text({ required: true }),
    verified: Type.bool(),
});

export class AdminsCollection<T> extends Collection<T> {}
export const Admins = new AdminsCollection("/api/admins", AdminSchema);
