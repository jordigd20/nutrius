import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PerfilService } from '../../services/perfil.service';
import { Perfil } from 'src/app/models/perfil.model';
import { Seguimiento } from 'src/app/models/seguimiento.model';
import { FormBuilder, Validators} from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import {Chart,registerables} from 'chart.js';
Chart.register(...registerables);
import { cargarChartAltura,cargarChartPeso,cargarTranscAltura,cargarTranscPeso } from '../../helpers/seguimientodatos';
import { convertirFecha, calcularEdad } from '../../helpers/convertirfecha';
import { ControlEventosService } from '../../services/control-eventos.service';

@Component({
  selector: 'app-seg-peso-altura',
  templateUrl: './seg-peso-altura.component.html',
  styleUrls: ['./seg-peso-altura.component.css']
})
export class SegPesoAlturaComponent implements OnInit {

  public idPerfil: string = '';
  public perfil!: Perfil;

  public totalSeguimiento: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = 10;
  public listaSeguimiento: Seguimiento[] = [];

  public fechasSeg: string[] = [];

  public perfSexo: number = 0;
  public perfPesoAct: number = 0;
  public perfAltAct: number = 0;
  public perfPesoObj: number = 0;
  public perfEdad: number = 0;

  public chartPeso: any = null;
  public chartAltura: any = null;
  public transcPeso: any = null;
  public transcAltura: any = null;

  public mostrarDif = true;

  public modalRef!: BsModalRef;
  public dataForm = this.fb.group({
    fecha: ['', Validators.required],
    peso: [0, Validators.required],
    altura: [0, Validators.required],

  });

  constructor(private route: ActivatedRoute,
              private router: Router,
              private perfilService: PerfilService,
              private fb: FormBuilder,
              private modalService: BsModalService,
              private controlEventosService: ControlEventosService,
              ) { }

  ngOnInit(): void {
    this.idPerfil = this.route.snapshot.params['uid'];
    this.cargarPesoAltura();
    this.cargarDetallesPerfil();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  cargarPesoAltura(){
    if(this.idPerfil !== ''){

      this.perfilService.cargarPesoAltura(this.idPerfil)
        .subscribe( async (res: any) => {
          if (res['seguimiento'].length === 0) {
            if (this.posicionActual > 0) {
              this.posicionActual = this.posicionActual - this.registrosPorPagina;
              if (this.posicionActual < 0) this.posicionActual = 0;
              this.cargarPesoAltura();
            } else {
              this.listaSeguimiento = [];
              this.totalSeguimiento = 0;
            }
          } else {
            this.listaSeguimiento = res['seguimiento'];
            for(let i = 0; i < this.listaSeguimiento.length; i++){
              if(this.listaSeguimiento[i].difObjetivo === null){
                this.mostrarDif = false;
              }
            }
            this.totalSeguimiento = res['page'].total;

            for(let i=0; i<this.totalSeguimiento; i++){
              let datecita = new Date(this.listaSeguimiento[i].fecha!);
              this.fechasSeg.push(await convertirFecha(datecita));
            }
          }

        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        });
    }
  }

  async cargarCharts(){
    this.chartPeso = await cargarChartPeso(this.perfPesoAct,this.perfEdad,this.perfSexo,'');
    this.chartAltura = await cargarChartAltura(this.perfAltAct,this.perfEdad,this.perfSexo,'');
    this.transcPeso = await cargarTranscPeso(this.listaSeguimiento,this.fechasSeg,'');
    this.transcAltura = await cargarTranscAltura(this.listaSeguimiento,this.fechasSeg,'');
  }

  cargarDetallesPerfil(){
    if(this.idPerfil !== ''){
      this.perfilService.cargarPerfil(this.idPerfil)
        .subscribe( async (res: any) => {
          if (res['existePerfil']) {
            this.perfPesoAct = res['existePerfil'].peso_actual;
            this.perfAltAct = res['existePerfil'].altura_actual;
            if(res['existePerfil'].peso_objetivo != -1){
              this.perfPesoObj = res['existePerfil'].peso_objetivo;
            }
            if(res['existePerfil'].sexo == 'NIÑO'){
              this.perfSexo = 1;
            }
            else if(res['existePerfil'].sexo == 'NIÑA'){
              this.perfSexo = 2;
            }

            this.perfEdad = await calcularEdad(res['existePerfil'].fecha_nacimiento);
            this.cargarCharts();
          }

        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        });
    }
  }

  openModal(template: TemplateRef<any>){
    this.modalRef = this.modalService.show(template);
  }

  updateCharts(){
    this.chartPeso.destroy();
    this.chartAltura.destroy();
    this.transcAltura.destroy();
    this.transcPeso.destroy();
  }

  registrarPesoAltura(){
    let fecha = new Date();
    this.dataForm.controls['fecha'].setValue(fecha);
    this.perfilService.registrarPesoAltura(this.idPerfil, this.dataForm.value)
    .subscribe( (res: any) => {
      this.modalRef.hide();
      this.cargarPesoAltura();
      this.updateCharts();
      this.cargarDetallesPerfil();
      Swal.fire({icon: 'success', title: 'Hecho!', text: 'Registro creado'});
    }, (err) => {
      console.error(err);
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo crear el Registro, vuelva a intentarlo',});
    });
  }

  cambiarPagina( pagina: number){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarPesoAltura();
  }

}
