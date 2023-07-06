import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoauthGuard implements CanActivate {
  constructor( private usuarioService: UsuarioService,
    private router: Router) {}

canActivate( next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  return this.usuarioService.validarNoToken()
    .pipe(
      tap( (res: any) => {
        if (!res) {

          switch (this.usuarioService.rol) {
            case 'ROL_ADMIN':
              this.router.navigateByUrl('/admin/inicio');
              break;
            case 'ROL_USUARIO':
              this.router.navigateByUrl('/inicio');
              break;
            case 'ROL_PREMIUM':
              this.router.navigateByUrl('/inicio');
              break;
          }
        }
      })
    );
}

}
