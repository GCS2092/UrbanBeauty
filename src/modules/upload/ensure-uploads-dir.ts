import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export function ensureUploadsDirectory() {
  const uploadsDir = join(process.cwd(), 'uploads');
  
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Dossier uploads créé');
  }
  
  return uploadsDir;
}

