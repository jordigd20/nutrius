import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';
import { UsuarioService } from '../services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor( private usuarioService: UsuarioService,
               private router: Router) {}

  canActivate(
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) {
  return this.usuarioService.validarToken()
    .pipe(
      tap( res => {
        // Si devuelve falso, el token no es bueno, salimos a login
        if (!res) {
          this.router.navigateByUrl('/login');
        } else {
          // Si el rol del usuario no coincide con el rol de la página, se le redirige a la página con su rol pertinente
          // Ejemplo: usuario normal intentando acceder a admin / admin intentando acceder a usuario
          // Rol: "*" pueden acceder todos
          if ((!next.data['rol'].includes('*')) && (!next.data['rol'].includes(this.usuarioService.rol))) {
              switch (this.usuarioService.rol) {
                case 'ROL_ADMIN':
                  this.router.navigateByUrl('/admin/inicio');
                  break;
                default:
                  this.router.navigateByUrl('/inicio');
                  break;
              }
          }
        }

      })
    );
  }

}
