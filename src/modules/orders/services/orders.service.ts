import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { CouponsService } from '../../coupons/services/coupons.service';
import { NotificationsService } from '../../notifications/services/notifications.service';

// Fonction utilitaire pour générer un numéro de commande
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CMD-${timestamp}-${random}`;
}

// Fonction utilitaire pour générer un code de suivi court et facile à retenir
function generateTrackingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclut les caractères ambigus
  let code = 'UB-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(userId?: string) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
        coupon: true,
        payment: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBySeller(sellerId: string) {
    // Récupérer toutes les commandes qui contiennent des produits du vendeur
    const orders = await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
        coupon: true,
        payment: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrer les commandes qui contiennent au moins un produit du vendeur
    return orders.filter(order => 
      order.items.some(item => item.product.sellerId === sellerId)
    );
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
        coupon: true,
        payment: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    return order;
  }

  async findByTrackingCode(trackingCode: string) {
    const order = await this.prisma.order.findUnique({
      where: { trackingCode },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        coupon: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable avec ce code de suivi');
    }

    // Ne pas retourner les informations sensibles pour les invités
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      trackingCode: order.trackingCode,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      discount: order.discount,
      shippingCost: order.shippingCost,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      trackingNumber: order.trackingNumber,
    };
  }

  async create(createOrderDto: CreateOrderDto, userId?: string) {
    // Vérifier que tous les produits existent et ont du stock
    const productIds = createOrderDto.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Un ou plusieurs produits sont introuvables ou inactifs');
    }

    // Calculer le sous-total
    let subtotal = 0;
    for (const item of createOrderDto.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(`Produit ${item.productId} introuvable`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${product.name}. Stock disponible : ${product.stock}`
        );
      }

      subtotal += item.price * item.quantity;
    }

    // Valider et appliquer le coupon si fourni
    let couponId: string | undefined;
    let discount = 0;

    if (createOrderDto.couponCode) {
      try {
        const coupon = await this.couponsService.validateCoupon({
          code: createOrderDto.couponCode,
          totalAmount: subtotal,
          userId,
        });

        discount = await this.couponsService.calculateDiscount(coupon, subtotal);
        couponId = coupon.id;

        // Incrémenter le compteur d'utilisation
        await this.prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            usageCount: { increment: 1 },
          },
        });
      } catch (error) {
        throw new BadRequestException(error.message || 'Coupon invalide');
      }
    }

    const shippingCost = createOrderDto.shippingCost || 0;
    const total = subtotal - discount + shippingCost;

    // Créer la commande
    const order = await this.prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        trackingCode: generateTrackingCode(),
        userId: userId || null,
        customerEmail: createOrderDto.customerEmail,
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress || createOrderDto.shippingAddress,
        shippingMethod: createOrderDto.shippingMethod,
        shippingCost,
        notes: createOrderDto.notes,
        couponId,
        subtotal,
        discount,
        total,
        items: {
          create: createOrderDto.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        coupon: true,
      },
    });

    // Mettre à jour le stock des produits et notifier les vendeuses
    const sellerProducts = new Map<string, Array<{ name: string; quantity: number }>>();
    
    for (const item of createOrderDto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { sellerId: true, name: true },
      });
      
      if (product?.sellerId) {
        if (!sellerProducts.has(product.sellerId)) {
          sellerProducts.set(product.sellerId, []);
        }
        sellerProducts.get(product.sellerId)!.push({
          name: product.name,
          quantity: item.quantity,
        });
      }

      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          salesCount: { increment: item.quantity },
        },
      });
    }

    // Envoyer des notifications aux vendeuses concernées
    for (const [sellerId, products] of sellerProducts.entries()) {
      try {
        const productNames = products.map(p => `${p.name} (x${p.quantity})`).join(', ');
        await this.notificationsService.sendToUser(sellerId, {
          title: 'Nouvelle commande reçue',
          body: `Une commande a été passée pour vos produits : ${productNames}`,
          data: {
            type: 'ORDER',
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        });
      } catch (error: any) {
        // Ne pas bloquer la création de commande si la notification échoue
        // La notification est toujours enregistrée en base même si FCM échoue
        console.error(`Erreur lors de l'envoi de notification à la vendeuse ${sellerId}:`, error);
      }
    }

    // Envoyer une notification au client si connecté
    if (userId) {
      try {
        await this.notificationsService.sendToUser(userId, {
          title: 'Commande confirmée',
          body: `Votre commande ${order.orderNumber} a été confirmée avec succès !`,
          data: {
            type: 'ORDER',
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi de notification au client:', error);
      }
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        coupon: true,
        payment: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Envoyer une notification au client si le statut change
    if (updateOrderDto.status && updateOrderDto.status !== order.status && updatedOrder.userId) {
      try {
        const statusLabels: Record<string, string> = {
          PENDING: 'En attente',
          PROCESSING: 'En traitement',
          PAID: 'Payée',
          SHIPPED: 'Expédiée',
          DELIVERED: 'Livrée',
          CANCELLED: 'Annulée',
        };

        await this.notificationsService.sendToUser(updatedOrder.userId, {
          title: 'Mise à jour de commande',
          body: `Le statut de votre commande ${updatedOrder.orderNumber} a été mis à jour : ${statusLabels[updateOrderDto.status] || updateOrderDto.status}`,
          data: {
            type: 'ORDER_UPDATE',
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            status: updateOrderDto.status,
          },
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi de notification:', error);
      }
    }

    return updatedOrder;
  }

  async remove(id: string) {
    const order = await this.findOne(id);

    // Si la commande est déjà payée ou livrée, ne pas permettre la suppression
    if (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      throw new BadRequestException('Impossible de supprimer une commande déjà payée ou livrée');
    }

    // Restaurer le stock
    for (const item of order.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          salesCount: { decrement: item.quantity },
        },
      });
    }

    return this.prisma.order.delete({
      where: { id },
    });
  }

  async clearSellerHistory(userId: string) {
    // Récupérer les commandes terminées/annulées du vendeur
    const ordersToDelete = await this.prisma.order.findMany({
      where: {
        status: { in: ['DELIVERED', 'CANCELLED'] },
        items: {
          some: {
            product: {
              sellerId: userId,
            },
          },
        },
      },
      select: { id: true },
    });

    // Supprimer les commandes (cascade vers les items)
    const deletedCount = await this.prisma.order.deleteMany({
      where: {
        id: { in: ordersToDelete.map(o => o.id) },
      },
    });

    return {
      message: `${deletedCount.count} commande(s) supprimée(s) de l'historique`,
      count: deletedCount.count,
    };
  }

  async updateSellerNotes(orderId: string, sellerId: string, sellerNotes: string) {
    // Vérifier que la commande existe et contient des produits du vendeur
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    // Vérifier que le vendeur a des produits dans cette commande
    const sellerHasProducts = order.items.some(
      (item) => item.product.sellerId === sellerId
    );

    if (!sellerHasProducts) {
      throw new BadRequestException('Vous n\'avez pas accès à cette commande');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { sellerNotes },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }
}

