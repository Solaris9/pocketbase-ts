import { authStore } from "./auth";
import { pocketBaseURL } from "./client";

export const select = <T, K extends keyof T = keyof T>(object: T, keys: K[]): Record<K, any> =>
    keys.reduce((acc, cur) => ({ ...acc, [cur]: object[cur] }), {} as any);

export const omit = <T extends Record<string, any>, K extends keyof T>(obj: T | undefined, keys: K[]) => {
    if (!obj) return {};
    keys.forEach(k => delete obj[k]);
    return obj;
}

export type RequestData = { params?: object, body?: object, form?: FormData, headers?: Record<string, string> };
export type RequestResult = {
    code: number;
    message: string;
    data: Record<string, unknown>
};

export const request = async <T>(path: string, data: RequestData = {}, method = "GET"): Promise<T> => {
    const options: RequestInit = { method, headers: data.headers };
    const query = new URLSearchParams();

    if (!options.headers) options.headers = {};

    if (data.form) {
        options.body = data.form;
        (options.headers as any)["Content-Type"] = "multipart/form-data";
    } else if (data.body) {
        options.body = JSON.stringify(data.body);
        (options.headers as any)["Content-Type"] = "application/json";
    }

    // @ts-ignore
    if (data.params) for (let key in data.params) query.set(key, data.params[key]);

    if (authStore.token && authStore.admin)
        (options.headers as any)["Authorization"] = authStore.token;

    const url = `${pocketBaseURL}${path}?${query}`;
    
    const res = await fetch(url, options);
    const json = await res.json();
    if (json.code) throw new Error(json.message);

    return json
};

// export const getFileUrl = <T>(collection: Collection<T>, id: string, file: string) => `${pocketBaseURL}/api/files/${collection.identifier}/${id}/${file}`;