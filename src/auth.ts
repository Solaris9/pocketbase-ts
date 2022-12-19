import { AdminsCollection } from "./client";
import { BaseDocument, Collection } from "./collection";
import { Schema, ExtractSchemaGeneric } from "./schema";
import { request } from "./utils"

class AuthStore {
    user: BaseDocument | null = null;
    token: string | null = null;
    admin: boolean = false;

    get loggedIn() {
        return !!this.token;
    }

    logout() {
        this.user = null;
        this.token = null;
        this.admin = false;
    }
}

export let authStore = new AuthStore();

//#region auth

export type AuthMethod = {
    name: string;
    state: string;
    codeVerifier: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    authUrl: string;
};

export type AuthMethodsResult = {
    usernamePassword: boolean;
    emailPassword: boolean;
    authProviders: AuthMethod[]
};

export const authMethods = async<T extends Collection<unknown>>(
    collection: T
): Promise<AuthMethodsResult> => {
    return await request(`${collection.path}/auth-methods`);
}

export type AuthenticationResult<T> = {
    token: string;
    record: T;
    meta?: any;
};

export const authPassword = async <T extends Collection<Schema<unknown>>>(
    collection: T,
    identity: string,
    password: string
): Promise<AuthenticationResult<ExtractSchemaGeneric<T["schema"]>>> => {
    const options = { body: { identity, password } };
    type Return = AuthenticationResult<ExtractSchemaGeneric<T["schema"]>>;    
    const json = await request<Return>(`${collection.path}/auth-with-password`, options, "POST");

    authStore.token = json.token;
    authStore.user = json.record as BaseDocument;
    if (collection instanceof AdminsCollection) authStore.admin = true;

    return json;
}

export type OAuth2Payload = {
    provider: string;
    code: string;
    codeVerifier: string;
    redirectUrl: string;
}

export const authOAuth2 = async <T extends Collection<Schema<unknown>>>(
    collection: T,
    payload: OAuth2Payload,
    data?: ExtractSchemaGeneric<T["schema"]>
): Promise<AuthenticationResult<ExtractSchemaGeneric<T["schema"]>>> => {
    type Return = AuthenticationResult<ExtractSchemaGeneric<T["schema"]>>;
    const options = { body: { ...payload, ...(data as any) } };
    const json = await request<Return>(`${collection.path}/auth-with-password`, options, "POST");

    authStore.token = json.token;
    authStore.user = json.record as BaseDocument;
    if (collection instanceof AdminsCollection) authStore.admin = true;

    return json;
}

export const autoRefresh = async <T extends Collection<Schema<unknown>>>(collection: T) => {
    type Return = AuthenticationResult<ExtractSchemaGeneric<T["schema"]>>;
    return await request<Return>(`${collection.path}/auto-refresh`);
}

//#endregion

//#region verification

export const requestVerification = async<T extends Collection<unknown>>(
    collection: T,
    email: string
) => {
    await request(`${collection.path}/request-verification`, { body: { email } }, "POST");
}

export const confirmVerification = async<T extends Collection<unknown>>(
    collection: T,
    token: string
) => {
    await request(`${collection.path}/confirm-verification`, { body: { token } }, "POST");
}

//#endregion

//#region password

export const requestPasswordReset = async<T extends Collection<unknown>>(
    collection: T,
    email: string
) => {
    return await request(`${collection.path}/request-password-reset`, { body: { email } }, "POST");
}

type ConfirmPasswordResetPayload = {
    token: string;
    password: string;
    passwordConfirm: string;
}

export const confirmPasswordReset = async<T extends Collection<unknown>>(
    collection: T,
    payload: ConfirmPasswordResetPayload
) => {
    await request(`${collection.path}/confirm-password-reset`, { body: payload }, "POST");
}

//#endregion

//#region email

export const requestEmailChange = async<T extends Collection<unknown>>(
    collection: T,
    newEmail: string
) => {
    await request(`${collection.path}/request-email-change`, { body: { newEmail } }, "POST");
}

export const confirmEmailChange = async<T extends Collection<unknown>>(
    collection: T,
    token: string,
    password: string
) => {
    await request(`${collection.path}/confirm-email-change`, { body: { token, password } }, "POST");
}

//#endregion

//#region external auth

export const listAuth = async<T extends Collection<unknown>>(
    collection: T
) => {
    if (!authStore.loggedIn) throw new RangeError("Not logged in.");
    return await request(`${collection.path}/${authStore.user!.id}/external-auths`);
}

export const unlinkAuth = async<T extends Collection<unknown>>(
    collection: T,
    provider: string
) => {
    if (!authStore.loggedIn) throw new RangeError("Not logged in.");
    return await request(`${collection.path}/${authStore.user!.id}/external-auths/${provider}`, {}, "DELETE");
}

//#endregion