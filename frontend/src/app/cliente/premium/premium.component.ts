import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Premium } from 'src/app/models/premium.model';
import { PremiumService } from 'src/app/services/premium.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { convertirFecha } from 'src/app/helpers/convertirfecha';
import { ControlEventosService } from '../../services/control-eventos.service';


@Component({
  selector: 'app-premium',
  templateUrl: './premium.component.html',
  styleUrls: ['./premium.component.css']
})
export class PremiumComponent implements OnInit {

  public uidUsu: string = this.usuarioService.uid;
  public loading: boolean = true;
  public esPremium: boolean = false;

  public planUsu: string = '';
  public metodoUsu: number = 0;
  public fechaUsu: string = '';
  public duracionUsu: number = 0;
  public precioUsu: number = 0;
  public uidPlanPrem: string = '';

  public planId: number = 0;
  public planSeleccionado: boolean = false;
  public mostrarErrorPlanes: boolean[] = [ false, false, false, false, false ];
  public mostrarTextoPlanActual: boolean[] = [ false, false, false, false, false ];

  public modalRef!: BsModalRef;

  public totalPlanes: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = 10;

  public listaPlanes: Premium[] = [];
  public ultimaSubscripcionId: string = '';

  public fechasFact: string[] = [];
  public fechasFinFact: string[] = [];

  public dataForm = this.fb.group({
    plan: ['', Validators.required],
    metodo_pago: [0, Validators.required],
    activo: [true, Validators.required]
  });

  constructor(private usuarioService: UsuarioService,
              private premiumService: PremiumService,
              private modalService: BsModalService,
              private fb: FormBuilder,
              private router: Router,
              private controlEventosService: ControlEventosService,
              ) { }

  ngOnInit(): void {

    if(this.usuarioService.rol=='ROL_PREMIUM'){
      this.esPremium=true;
    }

    this.cargarPremium();
    this.cargarFacturaciones();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  cargarUsuario() {
    this.loading = true;
    if(this.uidUsu!=='err'){
        this.usuarioService.cargarUsuario(this.uidUsu).subscribe( (res:any) => {});

      this.loading = false;
    }
  }

  cargarPremium() {
    this.loading = true;
    if(this.uidUsu!=='err' && this.esPremium){
        this.premiumService.cargarPremium(0,this.uidUsu).subscribe( async (res:any) => {

          if(res['planes'].length>0){
            let total =  res['page'].total;
            if(res['planes'][total-1].activo==true){
              this.ultimaSubscripcionId = res['planes'][total-1].subscripcion_id;

              this.planUsu = res['planes'][total-1].plan;
              this.metodoUsu = res['planes'][total-1].metodo_pago; // 1 -> tarjeta; 2 -> paypal
              let datecita = new Date(res['planes'][total-1].fecha_inicio);
              datecita.setDate(datecita.getDate() + res['planes'][total-1].duracion);

              this.fechaUsu = await convertirFecha(datecita);
              this.uidPlanPrem = res['planes'][total-1].uid;

              if(this.planUsu=='1 mes') this.planId = 1;
              else if(this.planUsu=='3 meses') this.planId = 2;
              else if(this.planUsu=='6 meses') this.planId = 3;
              else if(this.planUsu=='1 año') this.planId = 4;

              this.planSeleccionado = true;
            }
          }
        });

      this.loading = false;
    }
  }

  async cargarFacturaciones(){
    this.loading = true;
    if(this.uidUsu!=='err' && this.esPremium){
        this.premiumService.cargarPremium(this.posicionActual,this.uidUsu).subscribe( async (res:any) => {
          if (res['planes'].length === 0) {
            if (this.posicionActual > 0) {
              this.posicionActual = this.posicionActual - this.registrosPorPagina;
              if (this.posicionActual < 0) this.posicionActual = 0;
              this.cargarFacturaciones();
            } else {
              this.listaPlanes = [];
              this.totalPlanes = 0;
            }
          } else {
            this.listaPlanes = res['planes'];
            this.totalPlanes = res['page'].total;

            for(let i=0; i<this.totalPlanes; i++){
              const fechaInicio = new Date(this.listaPlanes[i].fecha_inicio);
              this.fechasFact.push(await convertirFecha(fechaInicio));

              const fechaFin = new Date(this.listaPlanes[i].fecha_inicio);
              fechaFin.setDate(fechaFin.getDate() + res['planes'][i].duracion);
              this.fechasFinFact.push(await convertirFecha(fechaFin));
            }
          }

        }, (err) => {
        });

      this.loading = false;
    }
  }

  openModal(template: TemplateRef<any>){
    this.modalRef = this.modalService.show(template);
  }

  cancelarPlanPrem(){
    const swalBB = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primario bg-danger quicksand-font',
        cancelButton: 'btn btn-gris quicksand-font'
      },
      buttonsStyling: false
    });

    swalBB.fire({
      title: 'Eliminar subscripción premium',
      html: '<p class="quicksand-font" style="font-size: 1.15rem">Lamentamos que quieras dar de baja tu subscripción.<br>'
            + '<b class="font-weight-bold">¿Estás seguro de que quieres cancelar tu subscripción premium? Dejarás de acceder a todas las ventajas asociadas a tu plan.</b></p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Dar de baja',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalBB.fire(
          '¡Eliminado!',
          'Tu subscripción ha sido cancelada',
          'success'
        )

        this.premiumService.cancelarPlanPremium(this.uidPlanPrem, this.ultimaSubscripcionId).subscribe((res : any) => {
          this.resetPrem();
        }, (err) => {
          console.error(err);
            const msgerror = err.error.msg || 'No se pudo completar la acción, por favor, vuelve a intentarlo más tarde';
            Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
        });

      }
    });
  }

  pagarPlanPrem(){
    let plano='';
    switch(this.planId){
        case 1: plano='1 mes'; break;
        case 2: plano='3 meses'; break;
        case 3: plano='6 meses'; break;
        case 4: plano='1 año'; break;
    }
    this.dataForm.value.plan = plano;
    this.dataForm.value.metodo_pago = this.metodoUsu;
    if(this.planUsu==''){ //crear plan premium
      this.premiumService.pagarPremium(this.uidUsu, this.dataForm.value)
        .subscribe( (res: any) => {
          if(localStorage.getItem('rol')=='ROL_USUARIO'){
            localStorage.setItem('rol', 'ROL_PREMIUM');
            this.router.navigateByUrl('/inicio/facturacion');
          }

        }, (err) => {
          console.error(err);
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo pagar, vuelva a intentarlo',});
        });
    }
    else{ //actualizar plan premium
      this.premiumService.actualizarPremium(this.uidPlanPrem, this.dataForm.value)
        .subscribe( (res: any) => {
          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Plan Premium Actualizado'});
          this.resetPrem();
        }, (err) => {
          console.error(err);
          const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
        });
    }
  }

  selectPlan(nplanid: number){
    this.planId = nplanid;
    this.planSeleccionado = true;
  }

  onItemChange(value:number){
    this.metodoUsu=value;
  }

  cambiarPagina( pagina: number){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarFacturaciones();
  }

  resetPrem(){
    this.planId=0;
    this.metodoUsu=0;
    this.planUsu = '';
    this.uidPlanPrem = '';
    this.fechaUsu = '';
    this.esPremium = false;
    localStorage.setItem('rol', 'ROL_USUARIO');
    this.cargarPremium();
    this.cargarFacturaciones();
  }

}
