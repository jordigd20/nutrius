import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonsModule } from '../commons/commons.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { InicioComponent } from './inicio/inicio.component';
import { ClienteLayoutComponent } from '../layouts/cliente-layout/cliente-layout.component';
import { PerfilesComponent } from './perfiles/perfiles.component';
import { FacturacionComponent } from './facturacion/facturacion.component';
import { CrearPlatoComponent } from './crear-plato/crear-plato.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { RecompensasComponent } from './recompensas/recompensas.component';
import { PremiumComponent } from './premium/premium.component';
import { BuscadorPlatoClienteComponent } from './buscador-plato-cliente/buscador-plato-cliente.component';
import { EditarMenuComponent } from './editar-menu/editar-menu.component';
import { MenusComponent } from './menus/menus.component';
import { ResumenComponent } from './resumen/resumen.component';
import { SegPesoAlturaComponent } from './seg-peso-altura/seg-peso-altura.component';
import { SeguimientoComidasComponent } from './seguimiento-comidas/seguimiento-comidas.component';
import { NgChartsModule } from 'ng2-charts';
import { RecompensasKidComponent } from './recompensas-kid/recompensas-kid.component';
import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';
import { CrearPerfilComponent } from './crear-perfil/crear-perfil.component';
import { PrintpdfComponent } from './printpdf/printpdf.component';
import { ValidarPagoComponent } from './validar-pago/validar-pago.component';

@NgModule({
  declarations: [
    ClienteLayoutComponent,
    InicioComponent,
    PerfilesComponent,
    FacturacionComponent,
    CrearPlatoComponent,
    UsuarioComponent,
    RecompensasComponent,
    PremiumComponent,
    BuscadorPlatoClienteComponent,
    EditarMenuComponent,
    MenusComponent,
    ResumenComponent,
    SegPesoAlturaComponent,
    SeguimientoComidasComponent,
    RecompensasKidComponent,
    EditarPerfilComponent,
    CrearPerfilComponent,
    PrintpdfComponent,
    ValidarPagoComponent,
  ],
  exports: [
    ClienteLayoutComponent,
    InicioComponent,
    PerfilesComponent,
    SeguimientoComidasComponent,
    SegPesoAlturaComponent,
    PrintpdfComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CommonsModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    NgChartsModule
  ]

})
export class ClienteModule { }
