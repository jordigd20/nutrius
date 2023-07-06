import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { FooterComponent } from './footer/footer.component';
import { NavbarAdminComponent } from './navbar-admin/navbar-admin.component';
import { PaginacionComponent } from './paginacion/paginacion.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarClienteComponent } from './navbar-cliente/navbar-cliente.component';
import { NavbarSeguimientoComponent } from './navbar-seguimiento/navbar-seguimiento.component';
import { NavbarKidComponent } from './navbar-kid/navbar-kid.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChatbotComponent } from './chatbot/chatbot.component';


@NgModule({
  declarations: [
    BreadcrumbComponent,
    FooterComponent,
    NavbarAdminComponent,
    PaginacionComponent,
    SidebarComponent,
    NavbarClienteComponent,
    NavbarSeguimientoComponent,
    NavbarKidComponent,
    ChatbotComponent,
  ],
  exports: [
    BreadcrumbComponent,
    FooterComponent,
    NavbarAdminComponent,
    PaginacionComponent,
    SidebarComponent,
    NavbarClienteComponent,
    NavbarSeguimientoComponent,
    NavbarKidComponent,
    ChatbotComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CommonsModule { }
