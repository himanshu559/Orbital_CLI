#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";

import {Command} from "commander";
import { login, logout, whoami } from "./commands/auth/login.js";

dotenv.config();

async function main() {
  console.log(
    chalk.cyan(
      figlet.textSync("Orbital CLi",{
        font:"Standard",
        horizontalLayout:"default"
      })
    )
  )
  console.log(chalk.blueBright("A cli based AI Tool \n"))

 const program = new Command("orbitals");

 program.version("0.0.1").description("Orbital Cli - A Cli based AI Tool").addCommand(login).addCommand(logout).addCommand(whoami);


 program.action(()=>{
  program.help();
 })
 program.parse()


}
main().catch((error)=>{
  console.log(chalk.red("Error Running orbital CLI"),error)
  process.exit(1);
})