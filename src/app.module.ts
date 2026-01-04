import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { ServicesModule } from './modules/services/services.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UploadModule } from './modules/upload/upload.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ProfileModule } from './modules/profile/profile.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { HairStyleRequestsModule } from './modules/hair-style-requests/hair-style-requests.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { QuickRepliesModule } from './modules/quick-replies/quick-replies.module';
import { ShippingAddressesModule } from './modules/shipping-addresses/shipping-addresses.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProductsModule,
    ServicesModule,
    CategoriesModule,
    UsersModule,
    CouponsModule,
    OrdersModule,
    UploadModule,
    BookingsModule,
    ProfileModule,
    FirebaseModule,
    NotificationsModule,
    ChatModule,
    HairStyleRequestsModule,
    ReviewsModule,
    AnalyticsModule,
    FavoritesModule,
    QuickRepliesModule,
    ShippingAddressesModule,
    RemindersModule,
    MaintenanceModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
