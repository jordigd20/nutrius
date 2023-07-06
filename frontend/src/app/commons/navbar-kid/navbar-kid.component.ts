import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KidService } from '../../services/kid.service';
import { Recompensa } from '../../models/recompensa.model';
import { Perfil } from 'src/app/models/perfil.model';
import { PerfilService } from '../../services/perfil.service';
import { RecompensaService } from '../../services/recompensas.service';
import { MenuPerfilService } from '../../services/menuperfil.service';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario.service';
import { ControlEventosService } from '../../services/control-eventos.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar-kid',
  templateUrl: './navbar-kid.component.html',
  styleUrls: ['./navbar-kid.component.css']
})
export class NavbarKidComponent implements OnInit {

  public modalRef!: BsModalRef;
  public pass: string = '';
  public formSubmit = false;

  public dataForm = this.fb.group({
    uid: [this.usuarioService.uid || '', [ Validators.required] ],
    pin_parental: ['', Validators.required ]
  });

  // ------- Recompensas --------
  public idPerfil: string = '';
  public perfil!: Perfil;

  public puntuacion: number = 0;
  public puntuacionRecompensa: number = 0;
  public suma: number = 0;
  public totalRecompensas: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = 10;

  public tienePinParental: boolean = false;

  public listaRecompensas: Recompensa[] = [];
  public submited = false;
  public disponibles = false;

  public des: number = 0;
  public alm: number = 0;
  public com: number = 0;
  public mer: number = 0;
  public cen: number = 0;

  public subs: Subscription;
  public pinIncorrecto: boolean = false;

  constructor(private fb: FormBuilder,
              private modalService: BsModalService,
              private kidService: KidService,
              private perfilService: PerfilService,
              private recompensaService: RecompensaService,
              private menuPerfilService: MenuPerfilService,
              private usuarioService: UsuarioService,
              private router: Router,
              private controlEventosService:ControlEventosService) { }

  ngOnInit(): void {
    this.idPerfil = this.router.url.split("/")[2];
    this.cargarPerfil();
    this.cargarRecompensas( false);
    this.comidasFaltan();
    this.comprobarTienePP();

    this.subs = this.controlEventosService.eventEmitterFunction.subscribe(
      (res: any)=> {
        if(JSON.parse(res)['pts']){
          const obj = JSON.parse(res);
          this.suma = obj.pts;
          this.puntuacion += this.suma;
          const perfilAct = { ...this.perfil };
          perfilAct.puntos_ganados = this.puntuacion;
          this.perfilService.actualizarPerfil(this.idPerfil, perfilAct).subscribe((res: any) => {});
        }
      }
    )
  }

  salir(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  comprobarPinParental(){
    if(!this.dataForm.valid){
      return;
    }

    this.kidService.comprobarPin(this.dataForm.value)
      .subscribe((res: any) => {
        if(res['check']){
          this.pinIncorrecto = false;
          this.formSubmit = true;
          this.modalRef.hide();
          this.router.navigateByUrl('/inicio');
        }
      }, (err) => {
        this.pinIncorrecto = true;
      });
  }

  campoValido(campo: string) {
    return this.dataForm.get(campo)?.valid || !this.formSubmit;
  }

  mostrarRecompensas(template: TemplateRef<any>) {
    this.cargarPerfil();
    this.modalRef = this.modalService.show(template, { class: 'modal-xl'});
  }

  cargarPerfil(){
    if(this.idPerfil !== 'err'){
      this.perfilService.cargarPerfil(this.idPerfil)
      .subscribe((res: any) => {
        if(res['existePerfil']){
          this.puntuacion = res['existePerfil'].puntos_ganados;
          this.perfil = res['existePerfil'];
          return;
        };
        }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
        return;
      });
    }
  }

  comprobarTienePP(){
    if(this.idPerfil != 'err'){
      this.perfilService.cargarPerfil(this.idPerfil)
      .subscribe((res: any) => {
        if(res['existePerfil']){
        this.usuarioService.cargarUsuario(res['existePerfil'].usuario).subscribe((res2: any) =>{
          if(res2['usuarios'].pin_parental != null){
            this.tienePinParental = true;
          }
          else{
            this.tienePinParental = false;
          }
        });
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

              this.puntuacionRecompensa = ress['recompensas'].puntos;
              if(this.perfil.puntos_ganados >= this.puntuacionRecompensa){
                this.listaRecompensas[i].canjeable = true;
              }else{
                this.listaRecompensas[i].canjeable = false;

                let faltan = this.puntuacionRecompensa - this.perfil.puntos_ganados;
                let puntosdia = this.des + this.alm + this.com + this.mer + this.cen;

                for(let j = 0; faltan > 0; j++) {
                  this.listaRecompensas[i].dias = j;
                  this.listaRecompensas[i].dias++;
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

  ngOnDestroy(): void{
    this.subs.unsubscribe();
  }
}
