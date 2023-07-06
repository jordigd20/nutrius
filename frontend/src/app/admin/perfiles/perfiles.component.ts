import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Perfil } from 'src/app/models/perfil.model';
import { PerfilService } from '../../services/perfil.service';
import Swal from 'sweetalert2';
import { convertirFecha, calcularEdad } from '../../helpers/convertirfecha';
import { cargarChartAltura, cargarChartPeso, cargarTranscAltura, cargarTranscPeso, cargarPesoAltura } from '../../helpers/seguimientodatos';
import { Seguimiento } from 'src/app/models/seguimiento.model';


@Component({
  selector: 'app-perfiles',
  templateUrl: './perfiles.component.html',
  styleUrls: ['./perfiles.component.css']
})
export class PerfilesComponent implements OnInit {

  public loading: boolean = true;

  public totalPerfiles: number = 0;

  public listaPerfiles: any[] = [];
  public fechPerfiles: string[] =[];

  public uidParent: string = 'err';
  public usuParent: string = '';

  public chartPeso: any[] = null;
  public chartAltura: any[] = null;
  public transcPeso: any[] = null;
  public transcAltura: any[] = null;

  constructor(private perfilService: PerfilService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.uidParent = this.route.snapshot.params['uid'];
    this.chartPeso = [];
    this.chartAltura = [];
    this.transcPeso = [];
    this.transcAltura = [];
    this.cargarPerfiles();
    this.cargarUsuario();
  }

  cargarPerfiles() {
    this.loading = true;
    if(this.uidParent!=='err'){
        this.perfilService.cargarPerfiles(this.uidParent).subscribe( async (res: any) =>{
          if (res['perfiles'].length === 0) {
              this.listaPerfiles = [];
              this.totalPerfiles = 0;
          } else {
            this.listaPerfiles = res['perfiles'];
            this.totalPerfiles = res['perfiles'].length;
            for(let i=0; i<this.totalPerfiles; i++){
              this.listaPerfiles[i].eliminando = false;
              let datecita = new Date(this.listaPerfiles[i].fecha_nacimiento);
              this.fechPerfiles[i] = await convertirFecha(datecita);
            }
            this.cargarDetallesPerfil();
          }
          this.loading = false;

        }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        this.loading = false;
      });
    }
  }

  borrarPerfil( uid: string, nombre: string, posPerfil: number) {
    Swal.fire({
      title: 'Eliminar perfil',
      text: `Al eliminar el perfil '${nombre}' se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Si, borrar',
      cancelButtonText: "Cancelar",
    }).then((result) => {
          if (result.value) {
            this.listaPerfiles[posPerfil].eliminando = true;
            this.perfilService.borrarPerfil(uid)
              .subscribe( res => {
                this.listaPerfiles[posPerfil].eliminando = false;
                this.cargarPerfiles();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  cargarUsuario() {
    this.loading = true;
    if(this.uidParent!=='err'){
        this.perfilService.cargarUsuario(this.uidParent).subscribe( (res:any) => {
          this.usuParent = res['usuarios'].nombre_usuario;
        });

      this.loading = false;
    }
  }

  async cargarCharts(per:number, perfPesoAct:number, perfAltAct:number,perfPesoObj:number,perfSexo:number,perfEdad:number,listaSeguimiento:Seguimiento[],fechasSeg:string[]){
    this.chartPeso[per] = await cargarChartPeso(perfPesoAct,perfEdad,perfSexo,per.toString());
    this.chartAltura[per] = await cargarChartAltura(perfAltAct,perfEdad,perfSexo,per.toString());
    this.transcPeso[per] = await cargarTranscPeso(listaSeguimiento,fechasSeg,per.toString());
    this.transcAltura[per] = await cargarTranscAltura(listaSeguimiento,fechasSeg,per.toString());
  }

  cargarDetallesPerfil(){
      for(let i=0; i<this.totalPerfiles; i++){
        this.perfilService.cargarPerfil(this.listaPerfiles[i].uid)
          .subscribe( async (res: any) => {
            if (res['existePerfil']) {
              var perfPesoAct = res['existePerfil'].peso_actual;
              var perfAltAct = res['existePerfil'].altura_actual;
              var perfPesoObj = 0;
              var perfSexo = 0;
              if(res['existePerfil'].peso_objetivo != -1){
                perfPesoObj = res['existePerfil'].peso_objetivo;
              }
              if(res['existePerfil'].sexo == 'NIÑO'){
                perfSexo = 1;
              }
              else if(res['existePerfil'].sexo == 'NIÑA'){
                perfSexo = 2;
              }
              var perfEdad = await calcularEdad(res['existePerfil'].fecha_nacimiento);
              var listaSeg: Seguimiento[] = await cargarPesoAltura(this.perfilService,this.listaPerfiles[i].uid);
              var fechaSeg: string[] = [];
              for(let y=0; y<listaSeg.length; y++){
                let datecita = new Date(listaSeg[y].fecha!);
                fechaSeg.push(await convertirFecha(datecita));
              }
              await this.cargarCharts(i,perfPesoAct,perfAltAct,perfPesoObj,perfSexo,perfEdad,listaSeg,fechaSeg);
            }

          }, (err) => {
            Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
          });
      }
  }

}
