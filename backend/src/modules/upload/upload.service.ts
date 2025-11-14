import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'fs/promises';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadToCloudinary(filePath: string) {
    try {
      // Vérifier que Cloudinary est configuré
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary n\'est pas configuré. Veuillez définir CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans les variables d\'environnement.');
      }

      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'urbanbeauty',
        resource_type: 'image',
      });

      // Supprimer le fichier local après upload
      await unlink(filePath);

      return result;
    } catch (error) {
      // Supprimer le fichier local en cas d'erreur
      try {
        await unlink(filePath);
      } catch {}
      throw error;
    }
  }
}

