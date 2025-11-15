import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findOrCreateConversation(userId1: string, userId2: string) {
    // Vérifier que les deux utilisateurs existent
    const user1 = await this.prisma.user.findUnique({ where: { id: userId1 } });
    const user2 = await this.prisma.user.findUnique({ where: { id: userId2 } });

    if (!user1 || !user2) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Trier les IDs pour garantir l'unicité
    const [participant1Id, participant2Id] = [userId1, userId2].sort();

    // Chercher une conversation existante
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        participant1Id_participant2Id: {
          participant1Id,
          participant2Id,
        },
      },
      include: {
        participant1: {
          include: { profile: true },
        },
        participant2: {
          include: { profile: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            sender: {
              include: { profile: true },
            },
          },
        },
      },
    });

    // Créer la conversation si elle n'existe pas
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          participant1Id,
          participant2Id,
        },
        include: {
          participant1: {
            include: { profile: true },
          },
          participant2: {
            include: { profile: true },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
              sender: {
                include: { profile: true },
              },
            },
          },
        },
      });
    }

    return conversation;
  }

  async getUserConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          include: { profile: true },
        },
        participant2: {
          include: { profile: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    return conversations.map(conv => {
      const otherParticipant = conv.participant1Id === userId 
        ? conv.participant2 
        : conv.participant1;
      const unreadCount = conv.participant1Id === userId 
        ? conv.unreadCount1 
        : conv.unreadCount2;

      return {
        id: conv.id,
        otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });
  }

  async getConversationMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participant1: true,
        participant2: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à accéder à cette conversation');
    }

    // Marquer les messages comme lus
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Mettre à jour le compteur de messages non lus
    if (conversation.participant1Id === userId) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadCount1: 0 },
      });
    } else {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadCount2: 0 },
      });
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  }

  async sendMessage(conversationId: string, senderId: string, createMessageDto: CreateMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participant1: true,
        participant2: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à envoyer un message dans cette conversation');
    }

    // Créer le message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: createMessageDto.content,
      },
      include: {
        sender: {
          include: { profile: true },
        },
      },
    });

    // Mettre à jour la conversation
    const otherParticipantId = conversation.participant1Id === senderId 
      ? conversation.participant2Id 
      : conversation.participant1Id;

    if (conversation.participant1Id === senderId) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessage: createMessageDto.content.substring(0, 100),
          unreadCount2: { increment: 1 },
        },
      });
    } else {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessage: createMessageDto.content.substring(0, 100),
          unreadCount1: { increment: 1 },
        },
      });
    }

    // Envoyer une notification à l'autre participant
    try {
      // Récupérer le nom de l'expéditeur
      const sender = await this.prisma.user.findUnique({
        where: { id: senderId },
        include: { profile: true },
      });
      
      const senderName = sender?.profile 
        ? `${sender.profile.firstName} ${sender.profile.lastName}`
        : sender?.email || 'Quelqu\'un';

      await this.notificationsService.sendToUser(otherParticipantId, {
        title: `Nouveau message de ${senderName}`,
        body: createMessageDto.content.length > 100 
          ? createMessageDto.content.substring(0, 100) + '...'
          : createMessageDto.content,
        data: {
          type: 'message',
          conversationId,
          userId: senderId,
          url: `/dashboard/chat?conversationId=${conversationId}`,
        },
      });
    } catch (error) {
      // Ne pas bloquer l'envoi du message si la notification échoue
      console.error('Erreur lors de l\'envoi de notification:', error);
    }

    return message;
  }

  async createConversation(userId: string, createConversationDto: CreateConversationDto) {
    return this.findOrCreateConversation(userId, createConversationDto.participant2Id);
  }
}

