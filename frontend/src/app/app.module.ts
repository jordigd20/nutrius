import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CommonsModule } from './commons/commons.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ClienteModule } from './cliente/cliente.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgChartsModule } from 'ng2-charts';
import { SeguimientoLayoutComponent } from './layouts/seguimiento-layout/seguimiento-layout.component';
import { KidModule } from './kid/kid.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    AppComponent,
    SeguimientoLayoutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AdminModule,
    AuthModule,
    ClienteModule,
    CommonsModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    NgChartsModule,
    KidModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
