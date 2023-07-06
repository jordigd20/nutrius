import { Component, OnInit } from '@angular/core';
import { PerfilService } from '../../services/perfil.service';
import { RecompensaService } from 'src/app/services/recompensas.service';
import { MenuPerfilService } from '../../services/menuperfil.service';
import { ActivatedRoute } from '@angular/router';
import { Recompensa } from '../../models/recompensa.model';
import { Perfil } from 'src/app/models/perfil.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recompensas-kid',
  templateUrl: './recompensas-kid.component.html',
  styleUrls: ['./recompensas-kid.component.css']
})
export class RecompensasKidComponent implements OnInit {

  public idPerfil: string = '';
  public perfil!: Perfil;

  public puntuacion!: number;
  public totalRecompensas: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = 10;

  public listaRecompensas: Recompensa[] = [];
  public submited = false;
  public disponibles = false;

  public des: number = 0;
  public alm: number = 0;
  public com: number = 0;
  public mer: number = 0;
  public cen: number = 0;

  constructor( private route: ActivatedRoute,
               private perfilService: PerfilService,
               private recompensaService: RecompensaService,
               private menuPerfilService: MenuPerfilService,
               ) { }

  ngOnInit(): void {
    this.idPerfil = this.route.snapshot.params['uid'];
    this.cargarPerfil();
    this.cargarRecompensas( false);
    this.comidasFaltan();
  }

  cargarPerfil(){
    if(this.idPerfil !== 'err'){
      this.perfilService.cargarPerfil(this.idPerfil)
      .subscribe((res: any) => {
        if(res['existePerfil']){
          this.perfil = res['existePerfil'];
          return;
        };
        }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
        return;
      });
    }
  }

  cargarRecompensas( disponibles: boolean) {
    if(this.idPerfil !== 'err'){
        let estado = 'canjeadas';
        if(!disponibles){
          estado = 'no canjeadas';
          this.disponibles = false;
        }else{
          estado = 'canjeadas';
          this.disponibles = true;
        }
        this.recompensaService.cargarRecompensasCanjeadas(this.posicionActual, this.idPerfil, estado)
        .subscribe( ( res: any) => {
          if (res['recompensas'].length === 0) {
            if (this.posicionActual > 0) {
              this.posicionActual = this.posicionActual - this.registrosPorPagina;
              if (this.posicionActual < 0) this.posicionActual = 0;
              this.cargarRecompensas(this.disponibles);
            } else {
              this.listaRecompensas = [];
              this.totalRecompensas = 0;
            }
          } else {
            this.listaRecompensas = res['recompensas'];
            this.totalRecompensas = res['page'].total;
          }

          this.listaRecompensas = res['recompensas'];
          this.ordenar();
          for(let i = 0; i < this.listaRecompensas.length; i++){
            this.recompensaService.cargarRecompensa(this.listaRecompensas[i].uid, this.posicionActual)
            .subscribe((ress : any) => {
              this.puntuacion = ress['recompensas'].puntos;
              if(this.perfil.puntos_ganados >= this.puntuacion){
                this.listaRecompensas[i].canjeable = true;
              }else{
                this.listaRecompensas[i].canjeable = false;

                let faltan = this.puntuacion - this.perfil.puntos_ganados;
                let puntosdia = this.des + this.alm + this.com + this.mer + this.cen;

                for(let j = 0; faltan > 0; j++) {
                  this.listaRecompensas[j].dias = j;
                  this.listaRecompensas[j].dias++;
                  faltan = faltan - puntosdia;
                }

              }
            }, (err) => {
            });
          }
        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        })
    }
  }

  ordenar(){
    this.listaRecompensas.sort((a, b) => a.puntos - b.puntos);
  }

  comidasFaltan(){
    this.menuPerfilService.cargarMenusPerfil(this.idPerfil)
      .subscribe((res: any) => {
        if(res['listaMenuPerfil']){
          res['listaMenuPerfil'].sort((a: any, b: any) => a.semana - b.semana);
          const menuActual = res['listaMenuPerfil'].length - 2;
          this.des = res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.desayuno.puntos;
          this.alm = res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.almuerzo.puntos;
          this.com = res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.comida.puntos;
          this.mer = res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.merienda.puntos;
          this.cen = res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.cena.puntos;
          return;
        };
        }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
        return;
      });
  }

}
