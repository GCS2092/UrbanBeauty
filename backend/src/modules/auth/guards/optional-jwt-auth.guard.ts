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
    // Si pas de token, ne pas bloquer
    return super.canActivate(context).catch(() => {
      // Si erreur (pas de token), continuer quand même
      return true;
    });
  }

  handleRequest(err: any, user: any, info: any) {
    // Ne pas lever d'erreur si pas d'utilisateur ou token invalide
    // Retourner l'utilisateur si présent, sinon null
    if (err || !user) {
      return null;
    }
    return user;
  }
}

