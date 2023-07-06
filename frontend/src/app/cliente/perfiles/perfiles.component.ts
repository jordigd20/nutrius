import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilService } from '../../services/perfil.service';
import { Perfil } from 'src/app/models/perfil.model';
import { PlatoPerfilService } from '../../services/platoperfil.service';
import { RecompensaService } from 'src/app/services/recompensas.service';
import { Plato } from '../../models/plato.model';
import { MenuPerfilService } from '../../services/menuperfil.service';
import Swal from 'sweetalert2';
import listaElementos from 'src/assets/json/elementos.json';
import { ControlEventosService } from '../../services/control-eventos.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-perfiles',
  templateUrl: './perfiles.component.html',
  styleUrls: ['./perfiles.component.css']
})
export class PerfilesComponent implements OnInit {

  public nombreUsuario: string = '';
  public uidUsu: string = this.usuarioService.uid;
  public pinparental: boolean = false;

  public loading: boolean = true;
  public loadingMenu: boolean = true;
  public contMenu: number = 0;
  public totalPerfiles: number = 0;
  public perfilesActivosN: number = 0;

  public listaPerfiles: Perfil[] = [];

  elementos: any = listaElementos;
  public platosMenuPerfs: Plato[][] = [];

  public diaTabla: number = 0;
  public diaHoy: number = 0;
  public diaTablaN: string = '';


  constructor(private perfilService: PerfilService,
              private usuarioService: UsuarioService,
              private platoPerfilService: PlatoPerfilService,
              private menuPerfilService: MenuPerfilService,
              private recompensaService: RecompensaService,
              private controlEventosService: ControlEventosService,
              private router: Router,
              private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarDiaHoy();
    this.cargarPerfiles();
    this.controlEventosService.rutaPerfiles(this.router.url);
    localStorage.setItem('motor', 'false');
    localStorage.setItem('recursos', 'false');
    localStorage.setItem('porcentaje','0');
  }

  cargarPerfiles() {
    this.loading = true;
    if(this.uidUsu!=='err'){
        this.perfilService.cargarPerfiles(this.uidUsu).subscribe( (res: any) =>{
          if (res['perfiles'].length === 0) {
              this.listaPerfiles = [];
              this.totalPerfiles = 0;
          } else {
            this.listaPerfiles = res['perfiles'];
            for(let i = 0; i < this.listaPerfiles.length; i++){
              this.cargarDatos(this.listaPerfiles[i].uid, i);
            }
            this.totalPerfiles = res['perfiles'].length;
            if(res['perfiles'].length >= 4){
              var b = document.getElementById("visibilidad");
              b?.setAttribute("style", "visibility:hidden");
            }
            this.cargarPlatosHoy();
          }
          this.loading = false;

        }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        this.loading = false;
      });
    }
  }

  async cargarPlatosHoy(){
    let conti = 0;
    this.loadingMenu = true;
    for(var z=0; z<this.listaPerfiles.length; z++){
      if(this.listaPerfiles[z].activo){
        this.perfilesActivosN++;
        this.menuPerfilService.cargarMenusPerfil(this.listaPerfiles[z].uid)
        .subscribe(async (res: any) => {
            let contador = 0;
            res['listaMenuPerfil'].sort((a: any, b: any) => a.semana - b.semana);
            const menuActual = res['listaMenuPerfil'].length - 2;

            for(let i=0; i<7; i++){
              for(let j=0; j<5; j++){
                let dia = this.elementos[4].elementos[i].propiedad;
                let comida = this.elementos[2].elementos[j].propiedad;
                let numo = res['listaMenuPerfil'][menuActual].menusem[dia]["comidas"][comida]["platos"].length;
                for(let x=0; x<numo; x++){
                  this.platosMenuPerfs[contador+(35*conti)] = [];
                  await this.cargarPlato(conti,contador,x,res['listaMenuPerfil'][menuActual].menusem[dia]["comidas"][comida]["platos"][x].plato);
                }
                contador++;
              }
            }
            conti++;
        });
      }
    }
  }

  async cargarPlato(z:number,i:number,j:number,uid:string){

    this.platoPerfilService.cargarPlatoPerfil(uid)
    .subscribe((res: any) => {
      this.platosMenuPerfs[i+(35*z)][j] = res['platosPerfil'].plato_id;
    });
  }

  cargarDiaHoy(){
    const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaActual = new Date().getDay();
    const hoy = diaSemana[diaActual];
    switch(hoy){
      case 'lunes':
        this.diaTabla = 0;
        break;
      case 'martes':
        this.diaTabla = 1;
        break;
      case 'miercoles':
        this.diaTabla = 2;
        break;
      case 'jueves':
        this.diaTabla = 3;
        break;
      case 'viernes':
        this.diaTabla = 4;
        break;
      case 'sabado':
        this.diaTabla = 5;
        break;
      case 'domingo':
        this.diaTabla = 6;
        break;
    }
    this.diaHoy = this.diaTabla;
    this.diaTablaN = this.elementos[4].elementos[this.diaTabla].nombre + ' (Hoy)';

  }

  cambiarDiaTabla(mas:number){
    if(this.diaTabla<=6 && this.diaTabla>0 && mas<0){
      this.diaTabla += mas;
    }
    if(this.diaTabla<6 && this.diaTabla>=0 && mas>0){
      this.diaTabla += mas;
    }
    this.diaTablaN = this.elementos[4].elementos[this.diaTabla].nombre;
    if(this.diaTabla==this.diaHoy){
      this.diaTablaN+=' (Hoy)';
    }
  }

  sumarPlatoCargado(n: number){
    let d = this.diaTabla*5+4+((this.perfilesActivosN-1)*35);
    if(n == d && this.loadingMenu){
      this.loadingMenu = false;
      this.cd.detectChanges();
    }
    return true;
  }

  cargarUsuario() {
    this.loading = true;
    if(this.uidUsu!=='err'){
        this.perfilService.cargarUsuario(this.uidUsu).subscribe( (res:any) => {
          this.nombreUsuario = res['usuarios'].nombre_usuario;
          if(res['usuarios'].pin_parental != null){
            this.pinparental = true;
          }
        });

      this.loading = false;
    }
  }

  borrarPerfil( uid: string, nombre: string) {
    Swal.fire({
      title: 'Eliminar perfil',
      html: `Al eliminar el perfil '${nombre}' se perderán todos los datos asociados. ¿Desea continuar?
              <br><br>Si lo prefiere puede desactivar el perfil`,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Si, borrar',
      cancelButtonText: "Desactivar",
      denyButtonText: "Cancelar"
    }).then((result) => {
          if(result.isDismissed){
            this.desactivarPerfil(uid);
            location.reload();
          }
          else if (result.value) {
            this.perfilService.borrarPerfil(uid)
              .subscribe( res => {
                this.cargarPerfiles();
                location.reload();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  desactivarPerfil(idPerfil: string){
    this.perfilService.cambiarEstadoPerfil(idPerfil)
      .subscribe((res: any) => {
        this.ngOnInit();
      },(err) =>{
          console.error(err);
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción de desactivar Perfil, vuelva a intentarlo',});
        });
  }

  activarPerfil(idPerfil: string, nombre: string){
    Swal.fire({
      title: 'Activar perfil',
      html: `¿Desea activar el perfil ${nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Si, activar',
      cancelButtonText: "Cancelar"
    }).then((result) => {
          if(result.isConfirmed){
            this.perfilService.cambiarEstadoPerfil(idPerfil)
            .subscribe((res: any) => {
              this.ngOnInit();
            },(err) => {
              console.error(err);
              Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción de activar Perfil, vuelva a intentarlo',});
            });
          }
      });
  }

  cargarDatos( idPerfil: string, pos: number){
    let completadas = 0;
    let falladas = 0;
      this.menuPerfilService.cargarMenuPerfil(idPerfil)
      .subscribe(( res: any) => {
        for(let i = 0; i < res['listaMenuPerfil'].length; i++){
          falladas = falladas + res['listaMenuPerfil'][i].comidas_falladas;
          completadas = completadas + res['listaMenuPerfil'][i].comidas_completadas;
        }
        this.listaPerfiles[pos].falladas = falladas;
        this.listaPerfiles[pos].completadas = completadas;
      }, (err) => {
        console.error(err);
      });
      this.menuPerfilService.cargarComidasCompletadas(idPerfil)
      .subscribe(( res: any ) => {
        this.listaPerfiles[pos].porcentaje_completadas = res.porcentaje;
      }, (err) => {
        console.error(err);
      });
      this.recompensaService.cargarRecompensasCanjeadas(0, idPerfil, "compradas")
      .subscribe(( res: any) => {
        this.listaPerfiles[pos].compradas = res['recompensas'].length;
      }, (err) => {
        console.error(err);
      });
  }

}
