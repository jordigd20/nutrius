import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormBuilder } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import listaElementos from 'src/assets/json/elementos.json';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

import { Perfil } from '../../models/perfil.model';
import { MenuPerfilService } from 'src/app/services/menuperfil.service';
import { PerfilService } from '../../services/perfil.service';
import { ActivatedRoute } from '@angular/router';
import { MenuPerfil } from '../../models/menuperfil.model';
import { convertirFecha } from 'src/app/helpers/convertirfecha';
import { ControlEventosService } from '../../services/control-eventos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {

  public idPerfil: string = '';
  public perfil!: Perfil;
  public loading: boolean = true;
  public menuPerfilNombre: string = '';
  public perfNombre: string = '';
  public premium: boolean = false;

  public totalMenusPerfil: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = environment.registrosPorPagina;

  public listaMenusPerfil: MenuPerfil[] = [];
  public fechasUso: string[] = [];

  public buscarForm = this.fb.group({
    fechaDesde: [],
    fechaHasta: []
  });

  elementos: any = listaElementos;

  public subs$!: Subscription;

  constructor(private fb: FormBuilder,
              private menuService: MenuService,
              private perfilService: PerfilService,
              private menuPerfilService: MenuPerfilService,
              private route: ActivatedRoute,
              private controlEventosService: ControlEventosService,
              private router: Router) { }

  ngOnInit(): void {
    this.idPerfil = this.route.snapshot.params['uid'];
    this.cargarPerfil();
    this.cargarMenusPerfil();
    this.comprobarPremium();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  comprobarPremium(){
    let rol = localStorage.getItem('rol');
    if(rol === 'ROL_PREMIUM') this.premium = true;
  }

  cargarPerfil(){

    if(this.idPerfil != 'err'){
      this.perfilService.cargarPerfil(this.idPerfil)
      .subscribe((res: any) => {
        if(res['existePerfil']){
          this.perfil = res['existePerfil'];
          this.perfNombre = this.perfil.nombre;
          return;
        };
        }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
        return;
      });
    }
  }

  borrar(fechaBorrar: string) {
    if(!this.buscarForm.controls[fechaBorrar].pristine) this.buscarForm.controls[fechaBorrar].reset();
  }

  cargarMenusPerfil(fechaDesde?: string, fechaHasta?: string) {

    if(!fechaDesde) fechaDesde = '';
    if(!fechaHasta) fechaHasta = '';

    this.loading = true;

    if(this.idPerfil !== 'err'){
      this.menuPerfilService.cargarMenusPerfilParam(this.idPerfil, this.posicionActual, '', fechaDesde, fechaHasta)
        .subscribe( async (res: any) => {
          if (res['listaMenuPerfil'].length === 0) {
            if (this.posicionActual > 0) {
              this.posicionActual = this.posicionActual - this.registrosPorPagina;
              if (this.posicionActual < 0) this.posicionActual = 0;
              this.cargarMenusPerfil();
            } else {
              this.listaMenusPerfil = [];
              this.totalMenusPerfil = 0;
            }
          } else {
            this.listaMenusPerfil = res['listaMenuPerfil'];
            this.totalMenusPerfil = res['page'].total;
            this.fechasUso = [];
            this.listaMenusPerfil.sort((a: any, b: any) => b.semana - a.semana);

            for(let i = 0; i < this.listaMenusPerfil.length; i++){
              this.listaMenusPerfil[i].menuId = res['listaMenuPerfil'][i].menu_id;
              this.listaMenusPerfil[i].perfilId = res['listaMenuPerfil'][i].perfil_id;
              this.listaMenusPerfil[i].fechaUso = res['listaMenuPerfil'][i].menusem.lunes.fecha;

              let datecita = new Date(this.listaMenusPerfil[i].fechaUso);
              this.fechasUso.push(await convertirFecha(datecita));

              this.menuService.cargarMenu(this.listaMenusPerfil[i].menuId)
                .subscribe((ress: any) => {
                  this.listaMenusPerfil[i].nombreMenu = ress['menus'].nombre;
                }, (errr) => {
                  Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
                  this.loading = false;
                });
            }
          }
          this.loading = false;
        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
          this.loading = false;
        });
      }
  }

  cambiarPagina( pagina: number ){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarMenusPerfil();
  }


  cambioFecha() {
    const fechaDesde = this.buscarForm.value['fechaDesde'];
    const fechaHasta = this.buscarForm.value['fechaHasta'];

    if(fechaDesde && fechaHasta) {
      this.cargarMenusPerfil(fechaDesde, fechaHasta);
      return;
    }

    if(fechaDesde) {
      this.cargarMenusPerfil(fechaDesde, '');
      return;
    }

    this.cargarMenusPerfil('', fechaHasta);

  }

}
