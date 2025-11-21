import chalk from "chalk";
import { Command } from "commander";
import yoctoSpinner from "yocto-spinner";
import { getStoredToken } from "../../../lib/token.js";

import prisma from "../../../lib/db.js";
import { select } from "@clack/prompts";
import { startChat } from "../../chat/chat-with-ai.js";
import { startToolChat } from "../../chat/chat-with-ai-tool.js";

const wakeUpAction = async() => {
  const token = await getStoredToken();

  if(!token?.access_token){
    console.log(chalk.red("Not Authenticated. please Login"))
    return;
  }

   const spinner = yoctoSpinner({
    text:"Fetching user Information...."
   })
   spinner.start()

   const user = await prisma.user.findFirst({
    where:{
      sessions:{
        some:{
          token:token.access_token
        }
      }
    },
    select:{
      id:true,
      name:true,
      email:true,
      image:true
    }
   });
   spinner.stop();
 
if(!user){
  console.log(chalk.red("User Not Found"));
  return;
}
console.log(chalk.green(`Welcome Back ${user.name}!\n`))

 const choice = await select({
  message: "Select an Option:",
  options: [
    {
      value: "chat",
      label: "Chat",
      hint: "Simple chat with AI",
    },
    {
      value: "tool",
      label: "Tool Calling",
      hint: "Chat with tools (Google Search, Code Execution)",
    },
    {
      value: "agent",
      label: "Agentic Mode",
      hint: "Advanced AI agent (Coming soon)",
    },
  ],
});

switch(choice){
  case "chat":
    startChat("chat");
    break;
  case "tool":
    await startToolChat();
    break;
  case "agent":
    console.log(chalk.yellow("Agentic mode coming soon"))
    break;
}



}

export const wakeUP = new Command("wakeup").description("wake up the Ai").action(wakeUpAction);