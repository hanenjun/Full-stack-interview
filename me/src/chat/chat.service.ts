import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Message {
  role: 'bot' | 'user';
  content: string;
  memoryAccess?: {
    type: 'create' | 'retrieve' | 'access';
    status?: 'pending' | 'approved' | 'rejected';
    signature?: string;
    walletAddress?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatData {
  conversations: Conversation[];
}

@Injectable()
export class ChatService {
  private dataPath: string;
  private chatData: ChatData;

  constructor() {
    // 确保使用src目录下的路径
    this.dataPath = path.join(__dirname, '..', '..', 'src', 'chat', 'chat.data.json');
    this.loadChatData();
  }

  private loadChatData(): void {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf8');
      this.chatData = JSON.parse(data);
      console.log('Chat data loaded successfully.');
    } catch (error) {
      console.error('Error loading chat data:', error);
      this.chatData = { conversations: [] };
    }
  }

  private saveChatData(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.chatData, null, 2));
    } catch (error) {
      console.error('Error saving chat data:', error);
    }
  }

  async getConversations(): Promise<Conversation[]> {
    console.log( this.chatData.conversations)
    return this.chatData.conversations
  }

  async getChatMessages(id: string): Promise<Message[]> {
    this.loadChatData()
    const conversation = this.chatData.conversations.find(conv => conv.id === id);
    return conversation?.messages || [];
  }

  async createConversation(title: string): Promise<Conversation> {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title,
      messages: [
        {
          role: 'bot',
          content: '你好，我是AI助手。我需要访问你的记忆来更好地为你服务。',
          memoryAccess: {
            type: 'access',
            status: 'pending',
          },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.chatData.conversations.push(newConversation);
    this.saveChatData();
    return newConversation;
  }

  async approveMemoryAccess(conversationId: string, signature: string, walletAddress: string): Promise<Message[]> {
    const conversation = this.chatData.conversations.find(conv => conv.id === conversationId);
    if (conversation?.messages[0]?.memoryAccess) {
      // 存储签名和钱包地址
      conversation.messages[0].memoryAccess.signature = signature;
      conversation.messages[0].memoryAccess.walletAddress = walletAddress;
      conversation.messages[0].memoryAccess.status = 'approved';
      conversation.messages.push({
        role: 'bot',
        content: '感谢你允许我访问你的记忆。我现在可以更好地为你服务了。',
      });
      conversation.updatedAt = new Date().toISOString();
      this.saveChatData();
    }
    return conversation?.messages || [];
  }

  async rejectMemoryAccess(conversationId: string): Promise<Message[]> {
    const conversation = this.chatData.conversations.find(conv => conv.id === conversationId);
    if (conversation?.messages[0]?.memoryAccess) {
      conversation.messages[0].memoryAccess.status = 'rejected';
      conversation.messages.push({
        role: 'bot',
        content: '我理解你的顾虑。我会在不访问记忆的情况下继续为你服务。',
      });
      conversation.updatedAt = new Date().toISOString();
      this.saveChatData();
    }
    return conversation?.messages || [];
  }

  async sendMessage(conversationId: string, content: string): Promise<Message[]> {
    const conversation = this.chatData.conversations.find(conv => conv.id === conversationId);
    if (!conversation) return [];

    // 添加用户消息
    const userMessage = {
      role: 'user' as const,
      content: content,
    };
    conversation.messages.push(userMessage);

    // 生成机器人回复
    const botResponse = this.generateBotResponse(content);
    const botMessage = {
      role: 'bot' as const,
      content: botResponse,
    };
    conversation.messages.push(botMessage);

    // 只有当用户允许记忆访问时才持久化存储
    if (conversation.messages[0]?.memoryAccess?.status === 'approved') {
      conversation.updatedAt = new Date().toISOString();
      this.saveChatData();
    }

    return conversation.messages;
  }

  private generateBotResponse(userMessage: string): string {
    // 简单的回复逻辑
    const responses = [
      '这是一个很有趣的观点，能详细说说吗？',
      '我明白你的意思了，让我想想...',
      '确实如此，我们可以进一步讨论这个话题。',
      '这让我想到了一些相关的内容...',
      '你说得对，还有什么想法吗？'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}