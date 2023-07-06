import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from '../layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { RecoveryComponent } from './recovery/recovery.component';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';

const routes: Routes = [
  { path: 'login', component: AuthLayoutComponent,
      children: [
        { path: '', component: LoginComponent },
      ]
  },
  { path: 'recovery', component: AuthLayoutComponent,
      children: [
        { path: '', component: RecoveryComponent },
        { path: ':email', component: RecoveryComponent}
      ]
  },
  { path: 'registro', component: AuthLayoutComponent,
      children: [
        { path: '', component: RegisterComponent },
      ]
  },
  { path: 'verification', component: AuthLayoutComponent,
      children: [
        { path: 'validar/:email', component: VerificationComponent },
        { path: ':token', component: VerificationComponent},
      ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
