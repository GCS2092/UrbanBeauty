import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'fs/promises';
import { VercelBlobService } from './vercel-blob.service';
import { extname } from 'path';
import * as uuid from 'uuid';

export interface UploadResult {
  url: string;
  publicId?: string; // Pour Cloudinary
  pathname?: string; // Pour Vercel Blob
  provider: 'cloudinary' | 'vercel-blob';
}

@Injectable()
export class UploadService {
  private storageProvider: 'cloudinary' | 'vercel-blob' | 'auto';

  constructor(
    private configService: ConfigService,
    private vercelBlobService: VercelBlobService,
  ) {
    // Configurer Cloudinary si disponible
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }

    // Déterminer le provider à utiliser
    const providerConfig = this.configService.get<string>('STORAGE_PROVIDER')?.toLowerCase();
    if (providerConfig === 'cloudinary' || providerConfig === 'vercel-blob') {
      this.storageProvider = providerConfig as 'cloudinary' | 'vercel-blob';
    } else {
      // Auto-détection : Vercel Blob en priorité si configuré, sinon Cloudinary
      this.storageProvider = 'auto';
    }
  }

  async uploadFile(filePath: string, originalFileName?: string): Promise<UploadResult> {
    const provider = this.getStorageProvider();

    if (provider === 'vercel-blob') {
      return this.uploadToVercelBlob(filePath, originalFileName);
    } else {
      return this.uploadToCloudinary(filePath);
    }
  }

  private getStorageProvider(): 'cloudinary' | 'vercel-blob' {
    if (this.storageProvider === 'auto') {
      // Auto-détection : Vercel Blob en priorité si configuré
      if (this.vercelBlobService.isConfigured()) {
        return 'vercel-blob';
      }
      return 'cloudinary';
    }
    return this.storageProvider;
  }

  async uploadToCloudinary(filePath: string): Promise<UploadResult> {
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

      return {
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary',
      };
    } catch (error) {
      // Supprimer le fichier local en cas d'erreur
      try {
        await unlink(filePath);
      } catch {}
      throw error;
    }
  }

  async uploadToVercelBlob(filePath: string, originalFileName?: string): Promise<UploadResult> {
    try {
      if (!this.vercelBlobService.isConfigured()) {
        throw new Error('Vercel Blob Storage n\'est pas configuré. Veuillez définir BLOB_READ_WRITE_TOKEN dans les variables d\'environnement.');
      }

      // Générer un nom de fichier unique
      const fileExtension = extname(filePath);
      const fileName = originalFileName 
        ? `${uuid.v4()}${extname(originalFileName)}`
        : `${uuid.v4()}${fileExtension}`;

      const result = await this.vercelBlobService.uploadFile(filePath, fileName, 'urbanbeauty');

      // Supprimer le fichier local après upload
      await unlink(filePath);

      return {
        url: result.url,
        pathname: result.pathname,
        provider: 'vercel-blob',
      };
    } catch (error) {
      // Supprimer le fichier local en cas d'erreur
      try {
        await unlink(filePath);
      } catch {}
      throw error;
    }
  }

  async deleteFile(url: string, provider?: 'cloudinary' | 'vercel-blob'): Promise<void> {
    const detectedProvider = provider || this.detectProviderFromUrl(url);

    if (detectedProvider === 'vercel-blob') {
      await this.vercelBlobService.deleteFileByUrl(url);
    } else if (detectedProvider === 'cloudinary') {
      // Extraire le public_id depuis l'URL Cloudinary
      const publicIdMatch = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)/);
      if (publicIdMatch) {
        const publicId = publicIdMatch[1];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Erreur lors de la suppression Cloudinary:', error);
        }
      }
    }
  }

  private detectProviderFromUrl(url: string): 'cloudinary' | 'vercel-blob' {
    if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
      return 'cloudinary';
    }
    if (url.includes('blob.vercel-storage.com') || url.includes('vercel-storage')) {
      return 'vercel-blob';
    }
    // Par défaut, essayer Cloudinary
    return 'cloudinary';
  }
}

