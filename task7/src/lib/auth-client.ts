import { createAuthClient } from "better-auth/react" 

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
if (!baseURL) {
    throw new Error("NEXT_PUBLIC_BETTER_AUTH_URL is not set");
}

export const authClient =  createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    headers: {
        "Content-Type": "application/json",
    },
    credentials: "include",
    browserClient: {
        signIn: {
            email: {
                enabled: true,
            },
        },
        signUp: {
            email: {
                enabled: true,
            },
        },
        signOut: {
            enabled: true,
        },
        getSession: {
            enabled: true,
        },
        updateSession: {
            enabled: true,
        },
        deleteSession: {
            enabled: true,
        },
        getUser: {
            enabled: true,
        },
        updateUser: {
            enabled: true,
        },
        deleteUser: {
            enabled: true,
        },
        getUserProviders: {
            enabled: true,
        },
        getUserProvider: {
            enabled: true,
        },
    },
})