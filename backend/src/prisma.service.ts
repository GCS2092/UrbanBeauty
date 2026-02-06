import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Aliases to keep existing service code stable after Prisma introspection
  get booking() {
    return this.bookings;
  }
  get category() {
    return this.categories;
  }
  get service() {
    return this.services;
  }
  get product() {
    return this.products;
  }
  get profile() {
    return this.profiles;
  }
  get order() {
    return this.orders;
  }
  get orderItem() {
    return this.order_items;
  }
  get payment() {
    return this.payments;
  }
  get review() {
    return this.reviews;
  }
  get shippingAddress() {
    return (this as any).shipping_addresses;
  }
  get reviewHelpful() {
    return (this as any).review_helpful;
  }
  get notification() {
    return this.notifications;
  }
  get notificationToken() {
    return (this as any).notification_tokens;
  }
  get favorite() {
    return this.favorites;
  }
  get image() {
    return this.images;
  }
  get conversation() {
    return (this as any).chat_conversations;
  }
  get message() {
    return (this as any).messages;
  }
  // If a messages model exists after introspection, expose it here.
}
