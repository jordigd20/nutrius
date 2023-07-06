import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CommonsModule } from '../commons/commons.module';
import { MotorGraficoLayoutComponent } from '../layouts/motor-grafico-layout/motor-grafico-layout.component';
import { EngineComponent } from './engine/engine.component';
import { InicioMotorComponent } from './inicio-motor/inicio-motor.component';
import { MenuMotorComponent } from './menu-motor/menu-motor.component';
import { DibujarPuntoComponent } from './dibujar-punto/dibujar-punto.component';


@NgModule({
  declarations: [
    MotorGraficoLayoutComponent,
    EngineComponent,
    InicioMotorComponent,
    MenuMotorComponent,
    DibujarPuntoComponent
  ],
  exports: [
    MotorGraficoLayoutComponent,
    EngineComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CommonsModule,
  ]
})
export class MotorGraficoModule { }
