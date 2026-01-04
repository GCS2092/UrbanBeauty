import { Module } from '@nestjs/common';
import { QuickRepliesService } from './services/quick-replies.service';
import { QuickRepliesController } from './controllers/quick-replies.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [QuickRepliesController],
  providers: [QuickRepliesService, PrismaService],
  exports: [QuickRepliesService],
})
export class QuickRepliesModule {}

