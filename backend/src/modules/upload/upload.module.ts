import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { VercelBlobService } from './vercel-blob.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, VercelBlobService],
  exports: [UploadService],
})
export class UploadModule {}

