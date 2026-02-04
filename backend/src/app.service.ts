import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async testDatabase() {
    try {
      // Test de connexion simple
      await this.prisma.$queryRaw`SELECT 1`;

      // Compter les utilisateurs (test de lecture)
      const userCount = await this.prisma.profiles.count();

      // Lister les tables (test de connexion)
      const tables = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `;

      return {
        status: 'success',
        message: 'Database connection successful',
        connected: true,
        userCount,
        tables: tables.map((t) => t.tablename),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
