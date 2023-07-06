import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClienteLayoutComponent } from '../layouts/cliente-layout/cliente-layout.component';
import { InicioComponent } from './inicio/inicio.component';
import { PerfilesComponent } from '../cliente/perfiles/perfiles.component';
import { FacturacionComponent } from '../cliente/facturacion/facturacion.component';
import { CrearPlatoComponent } from '../cliente/crear-plato/crear-plato.component';
import { BuscadorPlatoClienteComponent } from '../cliente/buscador-plato-cliente/buscador-plato-cliente.component';
import { EditarMenuComponent } from '../cliente/editar-menu/editar-menu.component';
import { MenusComponent } from '../cliente/menus/menus.component';
import { AuthGuard } from '../guards/auth.guard';
import { RecompensasComponent } from '../cliente/recompensas/recompensas.component';
import { UsuarioComponent } from '../cliente/usuario/usuario.component';
import { PremiumComponent } from '../cliente/premium/premium.component';
import { ResumenComponent } from '../cliente/resumen/resumen.component';
import { SegPesoAlturaComponent } from '../cliente/seg-peso-altura/seg-peso-altura.component';
import { SeguimientoComidasComponent } from '../cliente/seguimiento-comidas/seguimiento-comidas.component';
import { RecompensasKidComponent } from '../cliente/recompensas-kid/recompensas-kid.component';
import { EditarPerfilComponent } from '../cliente/editar-perfil/editar-perfil.component';
import { CrearPerfilComponent } from '../cliente/crear-perfil/crear-perfil.component';
import { ValidarPagoComponent } from './validar-pago/validar-pago.component';



const routes: Routes = [
  { path: '',
      children: [
        { path: '', component: InicioComponent },
      ]
  },
  { path: 'inicio', component: ClienteLayoutComponent,
      children: [
        { path: '', component: PerfilesComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM'] }},
        { path: 'usuario', component: UsuarioComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM'] }},
        { path: 'editar-perfil/:uid', component: EditarPerfilComponent, canActivate: [AuthGuard], data: {  rol: ['ROL_USUARIO', 'ROL_PREMIUM'] } },
        { path: 'crear-perfil', component: CrearPerfilComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM'] }},
        { path: 'recompensas/:uid', component: RecompensasComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM']}},
        { path: 'premium', component: PremiumComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM'] }},
        { path: 'seg-resumen/:uid', component: ResumenComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM'], ruta: '/inicio/seguimiento/:uid' } },
        { path: 'seg-peso-altura/:uid', component: SegPesoAlturaComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM'] } },
        { path: 'seg-comidas/:uid', component: SeguimientoComidasComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM'] }},
        { path: 'menus/:uid',
                children: [
                  { path: '', component: MenusComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM'], ruta: '/inicio/menus/:uid' } },
                  { path: 'ver-menu/:idmp', component: EditarMenuComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO'] } },
                  { path: 'editar-menu/:idmp',
                    children: [
                      { path: '', component: EditarMenuComponent, canActivate: [AuthGuard], data: { rol: ['ROL_PREMIUM'], ruta: '/inicio/menus/:uid/editar-menu/:idmp' } },
                      { path: 'buscador-plato-cliente/:pid/pos/:pos', component: BuscadorPlatoClienteComponent, canActivate: [AuthGuard], data: { rol: ['ROL_PREMIUM']} }
                    ]
                  }
                ] },
        { path: 'kid-recompensas/:uid', component: RecompensasKidComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM']}},
        { path: 'facturacion/:plan', component: FacturacionComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO'] } },
        { path: 'validar-pago', component: ValidarPagoComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO'] } },
        { path: 'crear-plato/:pid/:idmp/:idp/:pos', component: CrearPlatoComponent, canActivate: [AuthGuard], data: {  rol: ['ROL_PREMIUM'] } },
      ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ClienteRoutingModule { }
