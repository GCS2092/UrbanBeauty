import { Module } from '@nestjs/common';
import { HairStyleRequestsService } from './hair-style-requests.service';
import { HairStyleRequestsController } from './hair-style-requests.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [HairStyleRequestsController],
  providers: [HairStyleRequestsService, PrismaService],
})
export class HairStyleRequestsModule {}

