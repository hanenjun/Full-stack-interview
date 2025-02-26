import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':id')
  async getChatMessages(@Param('id') id: string) {
    return this.chatService.getChatMessages(id);
  }
  @Get('list/chats')
  async getConversations() {
    return this.chatService.getConversations();
  }

  @Post('new')
  async createConversation(@Body() { title }: { title: string }) {
    return this.chatService.createConversation(title);
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() { content }: { content: string },
  ) {
    return this.chatService.sendMessage(id, content);
  }

  @Post(':id/memory/approve-access')
  async approveMemoryAccess(
    @Param('id') id: string,
    @Body() { signature, walletAddress }: { signature: string; walletAddress: string },
  ) {
    return this.chatService.approveMemoryAccess(id, signature, walletAddress);
  }

  @Post(':id/memory/reject-access')
  async rejectMemoryAccess(@Param('id') id: string) {
    return this.chatService.rejectMemoryAccess(id);
  }
}