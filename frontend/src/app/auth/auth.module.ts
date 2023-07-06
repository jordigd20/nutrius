import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonsModule } from '../commons/commons.module';

import { AuthLayoutComponent } from '../layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { RecoveryComponent } from './recovery/recovery.component';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';


@NgModule({
  declarations: [
    AuthLayoutComponent,
    LoginComponent,
    RecoveryComponent,
    RegisterComponent,
    VerificationComponent
  ],
  exports: [
    AuthLayoutComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CommonsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class AuthModule { }
