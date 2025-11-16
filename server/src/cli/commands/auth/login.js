import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { logger } from "better-auth";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

import chalk from "chalk";
import { Command } from "commander";
import fs from "node:fs/promises";
import open from "open";
import os from "os";
import path from "path";
import yoctoSpinner from "yocto-spinner";
import * as z from "zod/v4";
import dotenv from "dotenv";
import prisma from "../../../lib/db.js";
import { error } from "node:console";

dotenv.config();

const URL = "http://localhost:3000";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

export async function loginAction(opts) {
  const options = z.object({
    serverUrl: z.string().optional(),
    clientId: z.string().optional(),
  });

  const serverUrl = options.serverUrl || URL;
  const clientId = options.clientId || CLIENT_ID;

  intro(chalk.bold("Auth cli Login"));

  const existingToken = false; //
  const exprired = false; //

  if (existingToken && !exprired) {
    const shouldReAuth = await confirm({
      massage: "You are Already LoggedIn. Do You Want To Login Again?",
      initialValue: false,
    });
    if (isCancel(shouldReAuth) || !shouldReAuth) {
      cancel("Login Cancelled ");
      process.exit(0);
    }
  }

  const authClient = createAuthClient({
    baseURL: serverUrl,
    plugins: [deviceAuthorizationClient()],
  });

  const spinner = yoctoSpinner({
    text: "Requestiing device Authorization ..... ",
  });
  spinner.start();

  try {
    const { data, error } = await authClient.device.code({
      client_id: clientId,
      scope: "oprnid Profile Email",
    });
    spinner.stop();
    if (error || !data) {
      logger.error(
        `failed to  request device authotrzation ${error.error_description}`
      );
      process.exit(1);
    }

    const {
  device_code,
  user_code,
  verification_uri,
  verification_uri_complete,
  interval = 5,
  expires_in,
} = data;

    console.log(chalk.cyan("device Authorization required "));
console.log(
  `Please visit ${chalk.underline.blue(
    verification_uri_complete || verification_uri
  )}`
);



    console.log(`Enter Code ${chalk.bold.green(user_code)}`);

    const shouldOpen = await confirm({
  message: "Open browser automatically?",
  initialValue: true
}); 

    // if(!isCancel(shouldOpen) && shouldOpen ){
    //   const urlToOpen = verification_url || verification_url_complete;
    //   await open(urlToOpen)
    // }
    if (!isCancel(shouldOpen) && shouldOpen) {
  await open(verification_uri_complete || verification_uri);
}


   console.log(
  chalk.gray(
    `Waiting for authorization (expires in ${Math.floor(expires_in / 60)} minutes)...`
  )
);


  } catch (error) {}
}





// Login Commander 


export const login = new Command("login")
  .description("Login to Better Auth")
  .option("--server-url <Url> ", " The Better Auth server URL", URL)
  .option("--client-id <id> ", "the OAuth Client ID ", CLIENT_ID)
  .action(loginAction);
