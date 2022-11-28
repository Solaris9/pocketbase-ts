import { ExtractCollectionGeneric, Resource } from "./client";
import { request } from "./utils"

type AuthStore = {
    id: string | null;
    token: string | null;
    admin: boolean;
}

export let authStore: AuthStore = {
    id: null,
    token: null,
    admin: false,
}

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

export const authMethods = async<T extends Resource>(resource: T): Promise<AuthMethodsResult> => {
    return await request(`${resource.path}/auth-methods`, {});
}

export type AuthenticationResult<T> = {
    token: string;
    record: T;
    meta?: any;
};

export const authPassword = async <T extends Resource>(
    resource: T,
    identity: string,
    password: string
): Promise<AuthenticationResult<ExtractCollectionGeneric<T>>> => {
    const options = { body: { identity, password } };
    type Return = AuthenticationResult<ExtractCollectionGeneric<T>>;
    const json = await request<Return>(`${resource.path}/auth-with-password`, options, "POST");

    authStore.token = json.token;
    if (resource.admin) authStore.admin = true;

    return json;
}

export type OAuth2Payload = {
    provider: string;
    code: string;
    codeVerifier: string;
    redirectUrl: string;
}

export const authOAuth2 = async<T extends Resource>(
    resource: T,
    payload: OAuth2Payload,
    data?: ExtractCollectionGeneric<T>
): Promise<AuthenticationResult<ExtractCollectionGeneric<T>>> => {
    type Return = AuthenticationResult<ExtractCollectionGeneric<T>>;
    const options = { body: { ...payload, ...(data as any) } };
    const json = await request<Return>(`${resource.path}/auth-with-password`, options, "POST");

    authStore.token = json.token;
    if (resource.admin) authStore.admin = true;

    return json;
}

export const autoRefresh = async<T extends Resource>(resource: T) => {
    type Return = AuthenticationResult<ExtractCollectionGeneric<T>>;
    return await request<Return>(`${resource.path}/auto-refresh`, {});
}

//#endregion

//#region verification

export const requestVerification = async<T extends Resource>(resource: T, email: string) => {
    await request(`${resource.path}/request-verification`, { body: { email } }, "POST");
}

export const confirmVerification = async<T extends Resource>(resource: T, token: string) => {
    await request(`${resource.path}/confirm-verification`, { body: { token } }, "POST");
}

//#endregion

//#region password

export const requestPasswordReset = async<T extends Resource>(resource: T, email: string) => {
    return await request(`${resource.path}/request-password-reset`, { body: { email } }, "POST");
}

type ConfirmPasswordResetPayload = {
    token: string;
    password: string;
    passwordConfirm: string;
}

export const confirmPasswordReset = async<T extends Resource>(resource: T, payload: ConfirmPasswordResetPayload) => {
    await request(`${resource.path}/confirm-password-reset`, { body: payload }, "POST");
}

//#endregion

//#region email

export const requestEmailChange = async<T extends Resource>(resource: T, newEmail: string) => {
    await request(`${resource.path}/request-email-change`, { body: { newEmail } }, "POST");
}

export const confirmEmailChange = async<T extends Resource>(resource: T, token: string, password: string) => {
    await request(`${resource.path}/confirm-email-change`, { body: { token, password } }, "POST");
}

//#endregion

//#region external auth

export const listAuth = async<T extends Resource>(resource: T) => {
    return await request(`${resource.path}/${authStore.id}/external-auths`, {});
}

export const unlinkAuth = async<T extends Resource>(resource: T, provider: string) => {
    return await request(`${resource.path}/${authStore.id}/external-auths/${provider}`, {}, "DELETE");
}

//#endregion