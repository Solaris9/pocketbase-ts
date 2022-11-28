import { Collection } from "./collection";
import { schema } from "./model";

export let pocketBaseURL: string | null = null;

export const init = (url: string) => pocketBaseURL = url;

export const Users: Collection<{ name: string }> = { path: "/api/collections/users/records" };
export const Collections: Collection<{ name: string }> = { path: "/api/collections" };
export const Admins: Collection<{ id: string }> = { path: "/api/admins", admin: true };

export type Resource = {
    path: string;
    admin?: boolean;
}

export type ExtractCollectionGeneric<T extends Collection<unknown>> = T extends Collection<infer X> ? X : never
