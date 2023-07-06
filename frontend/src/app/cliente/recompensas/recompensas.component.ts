import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { PerfilService } from '../../services/perfil.service';
import { RecompensaService } from 'src/app/services/recompensas.service';
import { MenuPerfilService } from 'src/app/services/menuperfil.service';
import { Perfil } from 'src/app/models/perfil.model';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { Recompensa } from '../../models/recompensa.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ControlEventosService } from '../../services/control-eventos.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-recompensas',
  templateUrl: './recompensas.component.html',
  styleUrls: ['./recompensas.component.css']
})
export class RecompensasComponent implements OnInit {

  public idPerfil: string = '';
  public perfil!: Perfil;
  public uidRecompensa: string = '';
  public puntos: number[] = [];
  public modalRef!: BsModalRef;
  public canjeadas: boolean = false;

  public puntosForm = this.fb.group({
    desayuno: ['', Validators.required],
    almuerzo: ['', Validators.required],
    comida: ['', Validators.required],
    merienda: ['', Validators.required],
    cena: ['', Validators.required]
  });

  public dataForm = this.fb.group({
    nombre: ['', Validators.required],
    puntos: ['', Validators.required],
    canjeada: [false, Validators.required]
  });

  public title: string = '';
  public puntuacion!: number;

  public totalRecompensas: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = 10;

  public listaRecompensas: Recompensa[] = [];
  public submited = false;
  public titulo: string = 'Crear Recompensa';
  public confirmar: string = 'Crear';
  public disponible: boolean = false;

  public puntosHipo: number= 0;
  public recompensaCompr: Recompensa;

  constructor(private perfilService: PerfilService,
              private menuPerfilService: MenuPerfilService,
              private recompensaService: RecompensaService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private modalService: BsModalService,
              private controlEventosService: ControlEventosService,
              ) { }

  ngOnInit(): void {
    this.idPerfil = this.route.snapshot.params['uid'];
    this.cargarPerfil();
    this.cargarPuntos();
    this.cargarRecompensas(false);
    this.controlEventosService.rutaPerfiles(this.router.url);
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

  cargarPuntos(){
    if(this.idPerfil !== 'err'){
      this.menuPerfilService.cargarMenusPerfil(this.idPerfil)
      .subscribe((res: any) => {
        if(res['listaMenuPerfil']){
          res['listaMenuPerfil'].sort((a: any, b: any) => a.semana - b.semana);
          const menuActual = res['listaMenuPerfil'].length - 2;
          this.puntos.push(res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.desayuno.puntos);
          this.puntos.push(res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.almuerzo.puntos);
          this.puntos.push(res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.comida.puntos);
          this.puntos.push(res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.merienda.puntos);
          this.puntos.push(res['listaMenuPerfil'][menuActual].menusem.lunes.comidas.cena.puntos);
          this.puntosForm.controls['desayuno'].setValue(this.puntos[0]);
          this.puntosForm.controls['almuerzo'].setValue(this.puntos[1]);
          this.puntosForm.controls['comida'].setValue(this.puntos[2]);
          this.puntosForm.controls['merienda'].setValue(this.puntos[3]);
          this.puntosForm.controls['cena'].setValue(this.puntos[4]);
          return;
        };
        }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
        return;
      });
    }
  }

  actualizarPuntos() {
    this.submited = true;

    if(this.puntosForm.valid){
      this.menuPerfilService.cargarMenusPerfil(this.idPerfil)
      .subscribe((res: any) => {
        for(let i = 0; i < res['listaMenuPerfil'].length; i++){
          this.menuPerfilService.actualizarPuntos(res['listaMenuPerfil'][i].uid ,this.puntosForm.value)
          .subscribe( (res: any) => {
            Swal.fire({icon: 'success', title: 'Hecho!', text: 'Puntos Actualizados'});
            this.modalRef.hide();
            this.puntos[0] = this.puntosForm.controls['desayuno'].value;
            this.puntos[1] = this.puntosForm.controls['almuerzo'].value;
            this.puntos[2] = this.puntosForm.controls['comida'].value;
            this.puntos[3] = this.puntosForm.controls['merienda'].value;
            this.puntos[4] = this.puntosForm.controls['cena'].value;
          }, (err) => {
            const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
            Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
          });
        }
          return;
        }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
        return;
      });

    }
  }

  cargarRecompensas( canjeadas: boolean) {
    let param;
    if(canjeadas){
      param = 'canjeadas';
      this.canjeadas = true;
    }else{
      param = 'no canjeadas';
      this.canjeadas = false;
    }
    if(this.idPerfil !== 'err'){
        this.recompensaService.cargarRecompensasCanjeadas(this.posicionActual, this.idPerfil, param)
        .subscribe( ( res: any) => {

          if (res['recompensas'].length === 0) {
            if (this.posicionActual > 0) {
              this.posicionActual = this.posicionActual - this.registrosPorPagina;
              if (this.posicionActual < 0) this.posicionActual = 0;
              this.cargarRecompensas(canjeadas);
            } else {
              this.listaRecompensas = [];
              this.totalRecompensas = 0;
            }
          } else {
            this.listaRecompensas = res['recompensas'];
            this.totalRecompensas = res['page'].total;
          }

          this.listaRecompensas = res['recompensas'];
          for(let i = 0; i < this.listaRecompensas.length; i++){
            this.recompensaService.cargarRecompensa(this.listaRecompensas[i].uid, this.posicionActual)
            .subscribe((ress : any) => {
              this.puntuacion = ress['recompensas'].puntos;
              if(this.perfil.puntos_ganados >= this.puntuacion){
                this.listaRecompensas[i].canjeable = true;
              }else{
                this.listaRecompensas[i].canjeable = false;
              }
            }, (err) => {
            });
          }
        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        })
    }
  }

  crearRecompensa(){
    if(this.idPerfil !== 'err'){
      if(this.confirmar === 'Crear'){
        this.dataForm.controls['canjeada'].setValue(false);
        this.recompensaService.crearRecompensa(this.idPerfil, this.dataForm.value)
        .subscribe( (res: any) => {
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Recompensa creada'});
          this.modalRef.hide();
          this.cargarRecompensas(this.canjeadas);
        }, (err) => {
          console.error(err);
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo crear la Recompensa, vuelva a intentarlo',});
        });
      }else{
        this.recompensaService.actualizarRecompensa(this.uidRecompensa, this.dataForm.value)
        .subscribe( (res: any) => {
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Recompensa Actualizada'});
          this.modalRef.hide();
          this.cargarRecompensas(this.canjeadas);
        }, (err) => {
          console.error(err);
          const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
        });
      }

    }
  }

  borrarRecompensa(uid: string){

    const swalBB = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primario bg-danger quicksand-font',
        cancelButton: 'btn btn-gris quicksand-font'
      },
      buttonsStyling: false
    });

    swalBB.fire({
      title: 'Eliminar recompensa',
      html: '<p class="quicksand-font" style="font-size: 1.15rem">'
            + '¿Estás seguro de que quieres eliminar esta recompensa?</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {

        this.recompensaService.borrarRecompensa(uid)
        .subscribe((res: any) => {
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Recompensa Eliminada'});
          this.cargarRecompensas(this.canjeadas);
        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo borrar la recompensa'});
        });

      }
    });

  }

  comprarRecompensa( uid: string) {
    this.puntuacion = -1;
    if(uid==''){
      uid = this.recompensaCompr.uid;
    }
    this.modalRef.hide();
    this.recompensaService.cargarRecompensa(uid, 0)
      .subscribe((res : any) => {
        this.puntuacion = res['recompensas'].puntos;
        if(this.perfil.puntos_ganados > this.puntuacion){
          this.dataForm.controls['canjeada'].setValue(true);
          this.dataForm.controls['nombre'].setValue(res['recompensas'].nombre);
          this.dataForm.controls['puntos'].setValue(res['recompensas'].puntos);
          this.recompensaService.actualizarRecompensa(uid, this.dataForm.value)
          .subscribe( ( ress: any) => {
            Swal.fire({icon: 'success', title: 'Hecho!', text: 'Recompensa Comprada'});
              this.cargarRecompensas(this.canjeadas);
              this.cargarPerfil();
          }, (err) => {
            Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo comprar la recompensa'});
          });
        }

      }, (err) => {
        console.error(err.error.msg);
      });
  }

  async cargarRecompensaComprar(uid: string){
    try {
      const res: any = await lastValueFrom(this.recompensaService.cargarRecompensa(uid, 0));
      this.recompensaCompr = res['recompensas'];
      this.puntosHipo = this.perfil.puntos_ganados - this.recompensaCompr.puntos;
    } catch (err: any) {
      console.error(err.error.msg);
    }
  }

  async openModal(template: TemplateRef<any>, nuevo: boolean, uid: string, modal: number){
    if(modal==3) {
      await this.cargarRecompensaComprar(uid);
    }else {
      this.cargarPuntos();
      if(!nuevo) {
        this.titulo = 'Editar Recompensa';
        this.confirmar = 'Guardar';

        const res: any = await lastValueFrom(this.recompensaService.cargarRecompensa(uid, 0))
        .catch( (err) => {
          console.error(err);
        });

        this.title = res['recompensas'].nombre;
        this.puntuacion = res['recompensas'].puntos;
        this.uidRecompensa = res['recompensas'].uid;
        this.dataForm.controls['nombre'].setValue(res['recompensas'].nombre);
        this.dataForm.controls['puntos'].setValue(res['recompensas'].puntos);

      }else {
        this.dataForm.controls['nombre'].setValue('');
        this.dataForm.controls['puntos'].setValue(0);
      }
    }

    this.modalRef = this.modalService.show(template);
  }


  cambiarPagina( pagina: number){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarRecompensas(this.canjeadas);
  }

}
