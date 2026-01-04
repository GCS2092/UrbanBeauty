import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as uuid from 'uuid';
import { ensureUploadsDirectory } from './ensure-uploads-dir';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'VENDEUSE', 'COIFFEUSE', 'MANICURISTE')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {
    // S'assurer que le dossier uploads existe au démarrage
    ensureUploadsDirectory();
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadsDir = ensureUploadsDirectory();
          cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuid.v4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Seules les images sont autorisées'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Upload vers le provider configuré (Vercel Blob ou Cloudinary)
    const result = await this.uploadService.uploadFile(file.path, file.originalname);

    return {
      url: result.url,
      publicId: result.publicId || result.pathname,
      provider: result.provider,
    };
  }
}

