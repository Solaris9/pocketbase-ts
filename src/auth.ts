import { request } from "./utils"

type AuthStore = {
    token: string | null;
    admin: boolean;
}

export let authStore: AuthStore = {
    token: null,
    admin: false,
}

export const adminAuthWithPassword = async (identity: string, password: string) => {
    const path = "admins/auth-with-password";
    const res = await request(path, { body: { identity, password } }, "POST");
    const json = await res.json();

    authStore.token = json.token;
    authStore.admin = true;
}