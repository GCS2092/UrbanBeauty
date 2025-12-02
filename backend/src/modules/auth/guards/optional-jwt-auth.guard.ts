import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * OptionalJwtAuthGuard - Ne bloque pas si pas de token JWT
 * Permet les requêtes guest tout en extrayant l'utilisateur si connecté
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Appeler le parent pour extraire l'utilisateur
    const result = super.canActivate(context);
    
    // Si c'est une Promise, gérer l'erreur
    if (result instanceof Promise) {
      return result.catch(() => {
        // Si erreur (pas de token), continuer quand même
        return true;
      });
    }
    
    // Si c'est un Observable, gérer l'erreur
    if (result instanceof Observable) {
      return result.pipe(
        catchError(() => {
          // Si erreur (pas de token), continuer quand même
          return of(true);
        })
      );
    }
    
    // Si c'est un boolean, le retourner tel quel
    return result;
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

