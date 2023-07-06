import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CommonsModule } from '../commons/commons.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PerfilesComponent } from './perfiles/perfiles.component';
import { PlatosComponent } from './platos/platos.component';
import { PlatoComponent } from './plato/plato.component';
import { MenusComponent } from './menus/menus.component';
import { MenuComponent } from './menu/menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BuscadorPlatoComponent } from './buscador-plato/buscador-plato.component';
import { NuevoMenuComponent } from './nuevo-menu/nuevo-menu.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    UsuariosComponent,
    PerfilesComponent,
    PlatosComponent,
    PlatoComponent,
    MenusComponent,
    MenuComponent,
    BuscadorPlatoComponent,
    NuevoMenuComponent,
  ],
  exports: [
    AdminLayoutComponent,
    DashboardComponent,
    UsuariosComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    CommonsModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule
  ]
})
export class AdminModule { }
