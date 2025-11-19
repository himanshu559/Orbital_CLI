import chalk from "chalk";
import boxen from "boxen";
import { text, isCancel, cancel, intro, outro } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import { AIService } from "../ai/google-service.js";
import { ChatService } from "../../service/chat.service.js";
// import { getStoredToken } from "../../commands/auth/login.js";
import { getStoredToken } from "../../lib/token.js";
import prisma from "../../lib/db.js";

marked.use(
  markedTerminal({
    // Styling options for terminal output
    code: chalk.cyan,
    blockquote: chalk.gray.italic,
    heading: chalk.green.bold,
    firstHeading: chalk.magenta.underline.bold,
    hr: chalk.reset,
    listitem: chalk.reset,
    list: chalk.reset,
    paragraph: chalk.reset,
    strong: chalk.bold,
    em: chalk.italic,
    codespan: chalk.yellow.bgBlack,
    del: chalk.dim.gray.strikethrough,
    link: chalk.blue.underline,
    href: chalk.blue.underline,
  })
);

const aiService = new AIService();
const chatService = new ChatService();

async function getUserFromToken() {
  const token = await getStoredToken()
  if (!token?.access_token) {
    throw new Error("Not authenticated. Please run 'orbitals login' first.");
  }
  const spinner = yoctoSpinner({ text: "Authenticating..." }).start();
  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: { token: token.access_token },
      },
    },
  });

 if(!user){
  spinner.error("User Not found ");
  throw new Error("User not found . Please Login Again");
 }
 spinner.success(`Welcome back ${user.name}`);
 return user;

}

async function initConversation(userId, conversationId = null, mode = "chat") {
  const spinner = yoctoSpinner({ text: "Loading conversation..." }).start();

  const conversation = await chatService.getOrCreateConversation(
    userId,
    conversationId,
    mode
  );

  spinner.success("Conversation Loaded");
  const conversationInfo = boxen(
  `\n${chalk.bold("Conversation")}: ${conversation.title}\n${chalk.gray("ID: " + conversation.id)}\n${chalk.gray("Mode: " + conversation.mode)}`,
  {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: "round",
    borderColor: "cyan",
    title: "💬 Chat Session",
    titleAlignment: "center",
  }
);
console.log(conversationInfo);

// Display existing messages if any
if (conversation.messages?.length > 0) {
  console.log(chalk.yellow("💬 Previous messages:\n"));
  displayMessages(conversation.messages);
}

return conversation;

}

function displayMessages(messages) {
  messages.forEach((msg) => {
    if (msg.role === "user") {
      const userBox = boxen(chalk.white(msg.content), {
        padding: 1,
        margin: { left: 2, bottom: 1 },
        borderStyle: "round",
        borderColor: "blue",
        title: "👤 You",
        titleAlignment: "left",
      });
      console.log(userBox);
    } else {
      const renderedContent = marked.parse(msg.content);
const assistantBox = boxen(renderedContent.trim(), {
  padding: 1,
  margin: { left: 2, bottom: 1 },
  borderStyle: "round",
  borderColor: "green",
  title: "🤖 Assistant",
  titleAlignment: "left",
});
console.log(assistantBox);
    }
  });

} 

async function saveMessage(conversationId, role, content) {
  return await chatService.addMessage(conversationId, role, content);
}

async function getAIResponse(conversationId) {
  const spinner = yoctoSpinner({
    text: "AI is thinking...",
    color: "cyan"
  }).start();

  const dbMessages = await chatService.getMessages(conversationId)
  const aiMessages = chatService.formatMessagesForAI(dbMessages);

  let fullResponse = " ";
  let isFirstChunk = true

  try {
  const result = await aiService.sendMessage(aiMessages, (chunk) => {
    if (isFirstChunk) {
      spinner.stop();
      console.log("\n");
      const header = chalk.green.bold("🤖 Assistant:");
      console.log(header);
      console.log(chalk.gray("-".repeat(60)));
      isFirstChunk = false;
    }
    fullResponse += chunk;
  });

 console.log("\n");
// Now render the complete markdown response
const renderedMarkdown = marked.parse(fullResponse);
console.log(renderedMarkdown);
console.log(chalk.gray("-".repeat(60)));
console.log("\n");

return result.content;

} catch (error) {
  // ... error handling logic ...
 spinner.error(" Failed To get AI response ");
 throw error;

}
}

async function updateConversationTitle(conversationId, userInput, messageCount) {
  if (messageCount === 1) {
    const title = userInput.slice(0, 50) + (userInput.length > 50 ? "..." : "");
    await chatService.updateTitle(conversationId, title);
  }
}
// this is the defffirent code 
async function chatLoop(conversation) {
  const helpBox = boxen(
    `${chalk.gray('• Type your message and press Enter')}\n` +
    `${chalk.gray('• Markdown formatting is supported in responses')}\n` +
    `${chalk.gray('• Type "exit" to end conversation')}\n` +
    `${chalk.gray('• Press Ctrl+C to quit anytime')}`,
    {
      padding: 1,
      margin: { bottom: 1 },
      borderStyle: "round",
      borderColor: "gray",
      dimBorder: true,
    }
  );
  console.log(helpBox)

 while(true) {
  const userInput = await text({
    message: chalk.blue("Your message"),
    placeholder: "Type your message...",
    validate(value) {
      if (!value || value.trim().length === 0) {
        return "Message cannot be empty";
      }
    },
  });
  if (isCancel(userInput)) {
  const exitBox = boxen(chalk.yellow("Chat session ended. Goodbye! 👋"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "yellow",
  });
  console.log(exitBox);
  process.exit(0);
}
if (userInput.toLowerCase() === "exit") {
  const exitBox = boxen(chalk.yellow("Chat session ended. Goodbye! 👋"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "yellow",
  });
  console.log(exitBox);
  break;
}

await saveMessage(conversation.id , "user" , userInput );
const message = await chatService.getMessages(conversation.id);

const aiResponse = await getAIResponse(conversation.id);
await saveMessage(conversation.id , "assistant" , aiResponse);
await updateConversationTitle(conversation.id , userInput ,message.length);
}
  // ... rest of the chatLoop function ...
}



export async function startChat(mode = "chat", conversationId = null) {
  try {
    intro(
      boxen(chalk.bold.cyan("Orbital AI Chat"), {
        padding: 1,
        borderStyle: "double",
        borderColor: "cyan",
      })
    );

    const user = await getUserFromToken();
    const conversation = await initConversation(user.id,conversationId,mode );
    await chatLoop(conversation);
    outro(chalk.green(" Thanks For Chatting "))
  } catch (error) {
    const errorBox = boxen(chalk.red(`Error:${error.message}`),{
      padding:1,
      margin:1,
      borderColor:"red",
      borderStyle:"round"
    })
    console.log(errorBox);
    process.exit(1);

  }
}
