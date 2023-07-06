import { NgModule } from "@angular/core";
import { KidLayoutComponent } from '../layouts/kid-layout/kid-layout.component';
import { KidComponent } from './kid/kid.component';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../commons/commons.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComidasComponent } from './comidas/comidas.component';


@NgModule({
  declarations: [
    KidLayoutComponent,
    KidComponent,
    ComidasComponent
  ],
  exports: [
    KidLayoutComponent,
    KidComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CommonsModule,
    FormsModule,
    ReactiveFormsModule
  ]

})
export class KidModule { }
