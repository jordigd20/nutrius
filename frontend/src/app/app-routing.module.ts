import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Routing
import { AdminRoutingModule } from './admin/admin.routing';
import { AuthRoutingModule } from './auth/auth.routing';
import { ClienteRoutingModule } from './cliente/cliente.routing';
import { KidRoutingModule } from './kid/kid.routing';

/*
  -- AuthRoutingModule --
  /login
  /recovery
  /registro

  -- AdminRoutingModule --
  /admin -> páginas de administrador [ROL_ADMIN]
    /admin/dashboard
    /admin/usuarios
    /admin/platos
    /admin/menus
*/

const routes: Routes = [
  {path:'**', redirectTo: ''}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: "ignore",
      anchorScrolling:'enabled',
      scrollPositionRestoration: 'enabled'
    }),
    AdminRoutingModule,
    AuthRoutingModule,
    ClienteRoutingModule,
    KidRoutingModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
