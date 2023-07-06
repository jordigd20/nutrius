import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from '../cliente/inicio/inicio.component';
import { KidLayoutComponent } from '../layouts/kid-layout/kid-layout.component';
import { KidComponent } from './kid/kid.component';
import { AuthGuard } from '../guards/auth.guard';
import { NgModule } from '@angular/core';


const routes: Routes = [
  { path: '',
      children: [
        { path: '', component: InicioComponent },
      ]
  },
  { path: '', component: KidLayoutComponent,
      children: [
        { path: 'perfil/:pid', component: KidComponent, canActivate: [AuthGuard], data: { rol: ['ROL_USUARIO', 'ROL_PREMIUM'] } }
      ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class KidRoutingModule { }
