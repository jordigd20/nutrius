import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MotorGraficoLayoutComponent } from '../layouts/motor-grafico-layout/motor-grafico-layout.component';
import { InicioMotorComponent } from './inicio-motor/inicio-motor.component';
import { MenuMotorComponent } from './menu-motor/menu-motor.component';
import { DibujarPuntoComponent } from './dibujar-punto/dibujar-punto.component';

const routes: Routes = [
  { path: 'motor-grafico', component: MotorGraficoLayoutComponent,
      children: [
        { path: '', component: InicioMotorComponent },
        { path: 'menu', component: MenuMotorComponent },
        { path: 'punto', component: DibujarPuntoComponent}
      ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class MotorGraficoRoutingModule { }
