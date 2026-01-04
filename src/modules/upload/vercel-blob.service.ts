import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put, del, list } from '@vercel/blob';
import { readFileSync } from 'fs';

@Injectable()
export class VercelBlobService {
  private token: string;

  constructor(private configService: ConfigService) {
    this.token = this.configService.get<string>('BLOB_READ_WRITE_TOKEN') || '';

    if (!this.token) {
      console.warn('⚠️ Vercel Blob Storage n\'est pas configuré. BLOB_READ_WRITE_TOKEN manquant.');
    } else {
      console.log('✅ Vercel Blob Storage configuré');
    }
  }

  async uploadFile(filePath: string, fileName: string, folder: string = 'urbanbeauty'): Promise<{ url: string; pathname: string }> {
    try {
      if (!this.token) {
        throw new Error('Vercel Blob Storage n\'est pas configuré. Veuillez définir BLOB_READ_WRITE_TOKEN dans les variables d\'environnement.');
      }

      // Lire le fichier
      const fileBuffer = readFileSync(filePath);
      const contentType = this.getContentType(fileName);

      // Créer le chemin avec le dossier
      const pathname = `${folder}/${fileName}`;

      // Upload le fichier vers Vercel Blob
      const blob = await put(pathname, fileBuffer, {
        access: 'public',
        contentType,
        token: this.token,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'upload vers Vercel Blob Storage: ${error.message}`);
    }
  }

  async deleteFile(pathname: string): Promise<void> {
    try {
      if (!this.token) {
        throw new Error('Vercel Blob Storage n\'est pas configuré.');
      }

      await del(pathname, {
        token: this.token,
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier ${pathname}:`, error);
      // Ne pas lancer d'erreur si le fichier n'existe pas
    }
  }

  async deleteFileByUrl(url: string): Promise<void> {
    try {
      // Extraire le pathname depuis l'URL Vercel Blob
      // Format: https://[hash].public.blob.vercel-storage.com/[pathname]
      const urlParts = url.split('/');
      const pathname = urlParts.slice(3).join('/'); // Tout après le domaine
      
      await this.deleteFile(pathname);
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier depuis l'URL ${url}:`, error);
    }
  }

  async listFiles(prefix?: string): Promise<any[]> {
    try {
      if (!this.token) {
        throw new Error('Vercel Blob Storage n\'est pas configuré.');
      }

      const { blobs } = await list({
        prefix,
        token: this.token,
      });

      return blobs;
    } catch (error) {
      console.error('Erreur lors de la liste des fichiers:', error);
      return [];
    }
  }

  private getContentType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  isConfigured(): boolean {
    return !!this.token;
  }
}

