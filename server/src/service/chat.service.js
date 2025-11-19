import prisma from "../lib/db.js";
export class ChatService{
/**
 * Create a new conversation
 * @param {string} userId - User ID
 * @param {string} mode - chat, tool, or agent
 * @param {string} title - Optional conversation title
 */
async createConversation(userId, mode = "chat", title = null) {
  return prisma.conversation.create({
    data: {
      userId,
      mode,
      title: title || `New ${mode} conversation`
    }
  });
}

/**
 * Get Or Create Conversation for user
 * @param {string} userId
 * @param {string} conversationId
 * @param {string} mode
 */

async getOrCreateConversation(userId, conversationId = null, mode = "chat") {
  if (conversationId) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (conversation) return conversation;
  }

 return await this.createConversation(userId, mode)

}

/**
 * Add A Message To Conversation
 * @param {string} conversationId
 * @param {string} role 
 * @param {string|object} content
 * 
 */
async addMessage(conversationId , role , content){
  const contentStr = typeof content === "string"? content : JSON.stringify(content);

  return await prisma.message.create({
    data:{
      conversationId,
      role,
      content:contentStr
    }
  })

}

/**
 * Get Convarsation Message
 * @param {string} conversationId
 */

async getMessages(conversationId) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  // Parse JSON content back to objects if needed
  return messages.map((msg) => ({
    ...msg,
    content: this.parseContent(msg.content),
  }));
}

/**
 * Get All Conversation for A User
 * @param {string} userId
 */

  async getUserConversation(userId) {
  return await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID (for security)
 */
async deleteConversation(conversationId, userId) {
  return await prisma.conversation.deleteMany({
    where: {
      id: conversationId,
      userId,
    },
  });
}

/**
 * Update conversation title
 * @param {string} conversationId - Conversation ID
 * @param {string} title - New title
 */
async updateTitle(conversationId, title) {
  return await prisma.conversation.update({
    where: { id: conversationId },
    data: { title },
  });
}

/**
 * Helper to parse content (JSON or string)
 */
parseContent(content) {
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

/**
 * Format messages for AI SDK
 * @param {Array} messages - Database messages
 */
formatMessagesForAI(messages) {
  return messages.map((msg) => ({
    role: msg.role,
    content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
  }));
}




}