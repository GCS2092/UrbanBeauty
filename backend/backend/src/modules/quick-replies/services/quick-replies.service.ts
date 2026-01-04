import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

interface CreateQuickReplyDto {
  title: string;
  content: string;
  shortcut?: string;
}

interface UpdateQuickReplyDto {
  title?: string;
  content?: string;
  shortcut?: string;
  order?: number;
}

@Injectable()
export class QuickRepliesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.quickReply.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const quickReply = await this.prisma.quickReply.findUnique({
      where: { id },
    });

    if (!quickReply) {
      throw new NotFoundException('Réponse rapide introuvable');
    }

    if (quickReply.userId !== userId) {
      throw new NotFoundException('Réponse rapide introuvable');
    }

    return quickReply;
  }

  async create(userId: string, dto: CreateQuickReplyDto) {
    // Vérifier le nombre max de réponses rapides (limite à 20)
    const count = await this.prisma.quickReply.count({
      where: { userId },
    });

    if (count >= 20) {
      throw new BadRequestException('Vous avez atteint la limite de 20 réponses rapides');
    }

    // Vérifier si le shortcut est déjà utilisé
    if (dto.shortcut) {
      const existing = await this.prisma.quickReply.findFirst({
        where: {
          userId,
          shortcut: dto.shortcut,
        },
      });

      if (existing) {
        throw new BadRequestException('Ce raccourci est déjà utilisé');
      }
    }

    // Trouver le prochain ordre
    const maxOrder = await this.prisma.quickReply.aggregate({
      where: { userId },
      _max: { order: true },
    });

    return this.prisma.quickReply.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        shortcut: dto.shortcut,
        order: (maxOrder._max.order || 0) + 1,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateQuickReplyDto) {
    await this.findOne(userId, id);

    // Vérifier si le shortcut est déjà utilisé par une autre réponse
    if (dto.shortcut) {
      const existing = await this.prisma.quickReply.findFirst({
        where: {
          userId,
          shortcut: dto.shortcut,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('Ce raccourci est déjà utilisé');
      }
    }

    return this.prisma.quickReply.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.quickReply.delete({
      where: { id },
    });
  }

  async reorder(userId: string, orderedIds: string[]) {
    // Vérifier que tous les IDs appartiennent à l'utilisateur
    const replies = await this.prisma.quickReply.findMany({
      where: { userId },
      select: { id: true },
    });

    const userReplyIds = new Set(replies.map((r) => r.id));
    
    for (const id of orderedIds) {
      if (!userReplyIds.has(id)) {
        throw new BadRequestException('ID de réponse rapide invalide');
      }
    }

    // Mettre à jour l'ordre
    const updates = orderedIds.map((id, index) =>
      this.prisma.quickReply.update({
        where: { id },
        data: { order: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findAll(userId);
  }

  // Créer des réponses rapides par défaut pour un nouvel utilisateur
  async createDefaults(userId: string) {
    const defaults = [
      {
        title: 'Salutations',
        content: 'Bonjour ! 👋 Merci de nous contacter. Comment puis-je vous aider ?',
        shortcut: '/hello',
        order: 1,
      },
      {
        title: 'Disponibilités',
        content: 'Je suis disponible du lundi au samedi de 9h à 18h. Souhaitez-vous prendre rendez-vous ?',
        shortcut: '/dispo',
        order: 2,
      },
      {
        title: 'Tarifs',
        content: 'Vous pouvez consulter tous mes tarifs sur ma page services. N\'hésitez pas si vous avez des questions !',
        shortcut: '/prix',
        order: 3,
      },
      {
        title: 'Merci',
        content: 'Merci beaucoup ! À bientôt 😊',
        shortcut: '/merci',
        order: 4,
      },
    ];

    await this.prisma.quickReply.createMany({
      data: defaults.map((d) => ({ ...d, userId })),
    });

    return this.findAll(userId);
  }
}

