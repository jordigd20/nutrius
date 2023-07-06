import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PerfilesComponent } from './perfiles/perfiles.component';
import { PlatosComponent } from './platos/platos.component';
import { PlatoComponent } from './plato/plato.component';
import { MenusComponent } from './menus/menus.component';
import { MenuComponent } from './menu/menu.component';
import { BuscadorPlatoComponent } from './buscador-plato/buscador-plato.component';
import { NuevoMenuComponent } from './nuevo-menu/nuevo-menu.component';

import { AuthGuard } from '../guards/auth.guard';


const routes: Routes = [
  { path: 'admin', component: AdminLayoutComponent, canActivate: [AuthGuard], data: { rol: ['ROL_ADMIN'] },
      children: [
        { path: 'inicio', component: DashboardComponent, data: { rol: ['ROL_ADMIN'],
                                                                    ruta: '/admin/inicio',
                                                                    titulo: 'Inicio',
                                                                    breadcrumbs: [] }
        },
        { path: 'usuarios',
          children: [
            { path: '', component: UsuariosComponent, data: { rol: ['ROL_ADMIN'],
                                                              ruta: '/admin/usuarios',
                                                              titulo: 'Usuarios',
                                                              breadcrumbs: [] }
            },
            { path: 'perfiles/:uid', component: PerfilesComponent, data: { rol: ['ROL_ADMIN'],
                                                                      ruta: '/admin/usuarios/perfiles/:uid',
                                                                      titulo: 'Perfiles',
                                                                      breadcrumbs: [{titulo: 'Usuarios', ruta: '/admin/usuarios'}] }
            },
          ]
        },
        { path: 'platos',
          children: [
            { path: '', component: PlatosComponent, data: { rol: ['ROL_ADMIN'],
                                                            ruta: '/admin/platos',
                                                            titulo: 'Platos',
                                                            breadcrumbs: [] }
            },
            { path: 'nuevo-plato', component: PlatoComponent, data: { rol: ['ROL_ADMIN'],
                                                                ruta: '/admin/platos/nuevo-plato',
                                                                titulo: 'Nuevo Plato',
                                                                breadcrumbs: [{titulo: 'Platos', ruta: '/admin/platos'}] }
            },
            { path: 'editar-plato/:uid', component: PlatoComponent, data: { rol: ['ROL_ADMIN'],
                                                                ruta: '/admin/platos/editar-plato',
                                                                titulo: 'Editar Plato',
                                                                breadcrumbs: [{titulo: 'Platos', ruta: '/admin/platos'}] }
            },

          ]
        },
        { path: 'menus',
          children: [
            { path: '', component: MenusComponent, data: { rol: ['ROL_ADMIN'],
                                                            ruta: '/admin/menus',
                                                            titulo: 'Menus',
                                                            breadcrumbs: [] }
            },
            { path: 'nuevo-menu', component: NuevoMenuComponent, data: { rol: ['ROL_ADMIN'],
                                                                ruta: '/admin/menus/nuevo-menu',
                                                                titulo: 'Nuevo Menu',
                                                                breadcrumbs: [{titulo: 'Menus', ruta: '/admin/menus'}] }
            },
            { path: 'editar-menu/:uidm',
              children: [
                { path: '', component: MenuComponent, data: { rol: ['ROL_ADMIN'],
                                                                ruta: '/admin/menus/editar-menu/:uidm',
                                                                titulo: 'Editar Menu',
                                                                breadcrumbs: [{titulo: 'Menus', ruta: '/admin/menus'}] }
                },
                { path: 'buscador-plato/:uid/pos/:pos', component: BuscadorPlatoComponent, data: { rol: 'ROL_ADMIN',
                                                                ruta: '/admin/menus/editar-menu/:uidm/buscador-plato/:uid/pos/:pos',
                                                                titulo: 'Seleccionar plato',
                                                                breadcrumbs: [{titulo: 'Menus', ruta: '/admin/menus'},
                                                                              {titulo: 'Editar Menu', ruta: '/admin/menus/editar-menu/:uidm'}]}
                },
              ]
            },

          ]
        },
        { path: '**', redirectTo: 'inicio' },
      ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
