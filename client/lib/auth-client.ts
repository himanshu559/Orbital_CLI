import { createAuthClient } from "better-auth/react"
import {deviceAuthorizationClient} from "better-auth/plugins"
export const authClient = createAuthClient({
    baseURL: "http://localhost:3000", // The base URL of your auth server
    plugins:[
        deviceAuthorizationClient()
    ]
})