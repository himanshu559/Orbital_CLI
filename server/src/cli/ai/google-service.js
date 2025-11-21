import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import config from "../../config/google.config.js";
import chalk from "chalk";

export class AIService {
  constructor() {
    if (!config.googleApiKey) {
      throw new Error("GOOGLE_API_KEY is not set in env");
    }
    this.model = google(config.model , {
      apiKey:config.googleApiKey,
    } )
  }


  /**
   * // Send Message And Get Streamin Responser 
   * @param {Array} messages
     @param {Function} oncChunk
     @param {Object} tools
     @param {Function} onToolCall
     @param {Promise<Object>} 
     
   * 
   * 
   * 
   */

 async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
  try {
    const streamConfig = {
      model: this.model,
      messages: messages,
    };

    if(tools && Object.keys(tools).length >0){
      streamConfig.tools = tools;
      streamConfig.maxSteps = 5

   console.log(chalk.gray(`[DEBUG] Tools enabled : ${Object.keys(tools).join(", ")}`))

    }
     


    const result = streamText(streamConfig);

  let fullResponse = ""
  
  for await (const chunk of result.textStream){
    fullResponse +=chunk;
    if(onChunk){
      onChunk(chunk)
    }
  }

  const fullResult = result;

  const toolCalls = [];
const toolResults = [];

if (fullResult.steps && Array.isArray(fullResult.steps)) {
  for (const step of fullResult.steps) {
    if (step.toolCalls && step.toolCalls.length > 0) {
      for (const toolCall of step.toolCalls) {
            toolCall.push(toolCall);

            if(onToolCall){
              onToolCall(toolCall);
            }
      }
    }
   if(step.toolResults && step.toolResults.length >0){
    toolResults.push(...step.toolResults)
   }


  }
}
  


  return{
    content:fullResponse,
    finishResponse:fullResult.finishReason,
    usage:fullResult.usage,
    toolCalls,
    toolResults,
    step:toolResults.steps
  }
 


  } catch (error) {
console.error(chalk.red("AI Service Error"), error.messages);
throw error;
  }
}

/**
 * 
 * Get a Non-streaming response
 *//**
 * @param {Array} messages - Array of message objects
 * @param {Object} tools - Optional tools
 * @returns {Promise<string>} Response text
 */
async getMessage(messages, tools = undefined) {
  let fullResponse = "";
  const result = await this.sendMessage(messages, (chunk) => {
    fullResponse += chunk
  },tools);
  return result.content;
}



}

export default AIService;
