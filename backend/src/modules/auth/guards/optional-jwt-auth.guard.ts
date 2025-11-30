import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * OptionalJwtAuthGuard - Ne bloque pas si pas de token JWT
 * Permet les requêtes guest tout en extrayant l'utilisateur si connecté
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Appeler le parent pour extraire l'utilisateur
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Ne pas lever d'erreur si pas d'utilisateur
    // Retourner null ou l'utilisateur
    return user || null;
  }
}

