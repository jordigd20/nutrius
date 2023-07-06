import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { FacturacionService } from '../../services/facturacion.service';
import { PremiumService } from '../../services/premium.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ControlEventosService } from '../../services/control-eventos.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  public nombreUsuario: string = '';
  public emailUsuario: string = '';
  public dataForm = this.fb.group({
    nombre_usuario: ['', Validators.required],
    email: ['', Validators.required]
  });

  public nombreFactura: string = '';
  public apellidosFactura: string = '';
  public fecha_nacimientoFactura: string ='';
  public dniFactura: string = '';
  public movilFactura: number = 0;
  public direccionFactura: string = '';
  public pisoFactura: string = '';
  public cpFactura: number = 0;
  public poblacionFactura: string = '';
  public provinciaFactura: string = '';
  public paisFactura: string = '';
  public facturaForm = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
    dni: ['', Validators.required],
    movil: ['', Validators.required],
    direccion: ['', Validators.required],
    piso: [''],
    codigo_postal: ['', Validators.required],
    poblacion: ['', Validators.required],
    provincia: ['', Validators.required],
    pais: ['', Validators.required]
  });

  public pswactualContra: string = '';
  public pswnuevaContra: string = '';
  public pswrepeatedContra: string = '';
  public pswForm = this.fb.group({
    password: ['', Validators.required],
    nuevopassword: ['', Validators.required],
    nuevopassword2: ['', Validators.required],
  });

  public tienePinParental: boolean = false;

  public crearPinForm = this.fb.group({
    pin_parental: ['', Validators.required],
    repetirpinparental: ['', Validators.required]
  });

  public pinactualPin: string = '';
  public pinnuevoPin: string = '';
  public pinrepeatedPin: string = '';
  public pinForm = this.fb.group({
    pin_parental: ['', Validators.required],
    nuevopinparental: ['', Validators.required],
    nuevopinparental2: ['', Validators.required],
  });

  public textoPremium: string = '';
  public fechahastaPremium: string = '';
  public premium: boolean = false;

  public uidUsu: string = this.usuarioService.uid;
  public waitingFacturacion: boolean = false;
  public waitingPersonales: boolean = false;
  public waitingPassword: boolean = false;
  public waitingCrearPinParental: boolean = false;
  public waitingPinParental: boolean = false;
  public submitedFactura: boolean = false;
  public submitedPersonales: boolean = false;
  public submitedPassword: boolean = false;
  public submitedCrearPinParental: boolean = false;
  public submitedPinParental: boolean = false;
  public modalRef!: BsModalRef;
  public formSubmit1 = false;

  public listaProvincias: any[] = []
  public listaPaises: any[] = [];
  public provinciasCargadas: boolean = false;
  public paisesCargados: boolean = false;

  constructor( private usuarioService: UsuarioService,
               private facturacionService: FacturacionService,
               private premiumService: PremiumService,
               private router: Router,
               private fb: FormBuilder,
               private modalService: BsModalService,
              private controlEventosService: ControlEventosService,
              ){}

  ngOnInit(): void{
    this.cargarUsuario();
    this.cargarFactura();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }


  cargarFactura(){
    if(this.uidUsu !== 'err'){
      this.facturacionService.cargarFactura(this.uidUsu).subscribe((res:any) =>{
        if(res['factura']){
          this.nombreFactura = res['factura'].nombre;
          this.apellidosFactura = res['factura'].apellidos;

          let fecha = new Date(res['factura'].fecha_nacimiento);
          this.fecha_nacimientoFactura = this.convertirFecha2(fecha);
          this.dniFactura = res['factura'].dni;
          this.movilFactura = res['factura'].movil;
          this.direccionFactura = res['factura'].direccion;
          this.pisoFactura = res['factura'].piso;
          this.cpFactura = res['factura'].codigo_postal;
          this.poblacionFactura = res['factura'].poblacion;
          this.provinciaFactura = res['factura'].provincia;
          this.paisFactura = res['factura'].pais;

          this.facturaForm.controls['nombre'].setValue(this.nombreFactura);
          this.facturaForm.controls['apellidos'].setValue(this.apellidosFactura);
          this.facturaForm.controls['fecha_nacimiento'].setValue(this.fecha_nacimientoFactura);
          this.facturaForm.controls['dni'].setValue(this.dniFactura);
          this.facturaForm.controls['movil'].setValue(this.movilFactura);
          this.facturaForm.controls['direccion'].setValue(this.direccionFactura);
          this.facturaForm.controls['piso'].setValue(this.pisoFactura);
          this.facturaForm.controls['codigo_postal'].setValue(this.cpFactura);
          this.facturaForm.controls['poblacion'].setValue(this.poblacionFactura);
          this.facturaForm.controls['provincia'].setValue(this.provinciaFactura);
          this.facturaForm.controls['pais'].setValue(this.paisFactura);

        };
      }, (err) =>{
        Swal.fire({icon:'error', title:'Oops...', text:'No se pudo completar la acción, vuelva a intentarlo'});
      });
    }
  }

  cargarUsuario(){
    if(this.uidUsu !== 'err'){
      this.usuarioService.cargarUsuario(this.uidUsu).subscribe((res:any) =>{
        if(res['usuarios']){
          this.nombreUsuario = res['usuarios'].nombre_usuario;
          this.emailUsuario = res['usuarios'].email;

          this.dataForm.controls['nombre_usuario'].setValue(this.nombreUsuario);
          this.dataForm.controls['email'].setValue(this.emailUsuario);

          //-------
          if(res['usuarios'].premium){
            this.premium = true;
            this.textoPremium = 'Eres Usuario Premium hasta';
            this.premiumService.cargarPremium(0,this.uidUsu).subscribe( (res:any) => {
              let total =  res['page'].total;
              let datecita = new Date(res['planes'][total-1].fecha_inicio);
              let hasta = res['planes'][total-1].duracion;

              this.fechahastaPremium = this.convertirFecha(datecita, hasta);
            });
          }
          else{
            this.textoPremium = '¡Descubre nuestro planes premium!';
          }

          if(res['usuarios'].pin_parental != null){
            this.tienePinParental = true;
          }

          return;
        };
      }, (err) =>{
        Swal.fire({icon:'error', title:'Oops...', text:'No se pudo completar la acción, vuelva a intentarlo'});
        return;
      });
    }
  }

  actualizarDatosPersonales(){
    this.submitedPersonales = true;

    if(!this.dataForm.valid){
      return;
    }

    this.waitingPersonales = true;
    this.usuarioService.cargarUsuario(this.uidUsu).subscribe((res: any) =>{
      this.usuarioService.actualizarDatosPersonales(res['usuarios'].uid, this.dataForm.value).subscribe((res: any) =>{
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Datos Personales Actualizados'});
        this.waitingPersonales = false;
      }, (err) =>{
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
      this.waitingPersonales = false;
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
      this.waitingPersonales = false;
    });

  }

  actualizarFactura(){
    this.submitedFactura = true;

    if(!this.facturaForm.valid){
      return;
    }

    this.waitingFacturacion = true;
    this.facturacionService.cargarFactura(this.uidUsu).subscribe((res:any) =>{
      this.facturacionService.actualizarFact(res['factura']._id, this.facturaForm.value).subscribe((res: any) =>{
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Datos de Facturación Actualizados'});
        this.waitingFacturacion = false;
      }, (err) =>{
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
        this.waitingFacturacion = false;
      });
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
      this.waitingFacturacion = false;
    });

  }

  actualizarPsw(){
    this.submitedPassword = true;

    if(!this.pswForm.valid){
      return;
    }

    this.waitingPassword = true;
    this.usuarioService.cargarUsuario(this.uidUsu).subscribe((res: any) =>{
      this.usuarioService.actualizarPsw(res['usuarios'].uid, this.pswForm.value).subscribe((res: any) =>{
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Contraseña Actualizada'});
        this.waitingPassword = false;
        this.modalRef.hide();
      }, (err) =>{
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
      this.waitingPassword = false;
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
      this.waitingPassword = false;
    });

  }

  crearPinParental(){
    this.submitedCrearPinParental = true;

    if(!this.crearPinForm.valid){
      return;
    }

    this.waitingCrearPinParental = true;
    this.usuarioService.cargarUsuario(this.uidUsu).subscribe((res: any) =>{
      this.usuarioService.crearPinParental(res['usuarios'].uid, this.crearPinForm.value).subscribe((res: any) =>{
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Pin Parental creado'});
        this.waitingCrearPinParental = false;
        this.modalRef.hide();
        this.tienePinParental = true;
      }, (err) =>{
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
      this.waitingCrearPinParental = false;
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
      this.waitingCrearPinParental = false;
    });
  }

  actualizarPin(){
    this.submitedPinParental = true;

    if(!this.pinForm.valid){
      return;
    }

    this.waitingPinParental = true;
    this.usuarioService.cargarUsuario(this.uidUsu).subscribe((res: any) =>{
      this.usuarioService.actualizarPinParental(res['usuarios'].uid, this.pinForm.value).subscribe((res: any) =>{
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Pin Parental Actualizado'});
        this.waitingPinParental = false;
        this.modalRef.hide();
      }, (err) =>{
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
      this.waitingPinParental = false;
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
      this.waitingPinParental = false;
    });
  }

  eliminarPinParental(){
    this.usuarioService.cargarUsuario(this.uidUsu).subscribe((res: any) =>{
      this.usuarioService.borrarPinParental(res['usuarios'].uid).subscribe((res: any) =>{
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Pin Parental Eliminado'});
        this.tienePinParental = false;
        this.modalRef.hide();
      }, (err) =>{
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
    });
  }

  darsedebaja(){
    const swalBB = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primario bg-danger quicksand-font',
        cancelButton: 'btn btn-gris quicksand-font'
      },
      buttonsStyling: false
    });

    swalBB.fire({
      title: 'Eliminar la cuenta',
      html: '<p class="quicksand-font" style="font-size: 1.15rem">Lamentamos que quieras eliminar tu cuenta.<br>'
            + '<b class="font-weight-bold">¿Estás seguro de que quieres dar de baja tu usuario? Todos tus datos asociados a la cuenta se borrarán.</b></p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        swalBB.fire(
          '¡Eliminado!',
          'Has eliminado tu usuario',
          'success'
        )
        this.usuarioService.cargarUsuario(this.uidUsu).subscribe((res: any) =>{
          this.usuarioService.borrarUsuario(res['usuarios'].uid).subscribe((res: any) =>{
            window.location.href = "['/inicio']";
          });
        });
      }
    });
  }

  convertirFecha(datecita: Date, hasta: number): string{
    datecita.setDate(datecita.getDate() + hasta);
    let year = datecita.getFullYear().toString();
    let month = datecita.getMonth()+1;
    let dt = datecita.getDate();
    let stringo= '';

    if (dt < 10) {
      stringo += '0' + dt.toString();
    }else{
      stringo += dt.toString();
    }
    stringo+='-';
    if (month < 10) {
      stringo += '0' + month.toString();
    }else{
      stringo += month.toString();
    }
    stringo+='-'+year.toString();
    return stringo;
  }

  convertirFecha2(datecita: Date): string{
    let year = datecita.getFullYear().toString();
    let month = datecita.getMonth()+1;
    let dt = datecita.getDate();
    let stringo= '', sdia='', smes='', syear='';

    if (dt < 10) {
      sdia = '0' + dt.toString();
    }else{
      sdia = dt.toString();
    }
    if (month < 10) {
      smes = '0' + month.toString();
    }else{
      smes = month.toString();
    }
    syear = year.toString();
    stringo = syear + '-' + smes + '-' + sdia;
    return stringo;
  }

  refresh(): void{
    window.location.reload();
  }

  /*VALIDACIONES DE FORMULARIO*/

  campoValido(campo: string, formulario: string) {
    if(formulario === 'personal')
      return this.dataForm.get(campo)?.valid || !this.submitedPersonales;

    if(formulario === 'factura')
      return this.facturaForm.get(campo)?.valid || !this.submitedFactura;

    if(formulario === 'password')
      return this.pswForm.get(campo)?.valid || !this.submitedPassword;

    if(formulario === 'crearpin_parental')
    return this.crearPinForm.get(campo)?.valid || !this.submitedCrearPinParental;

    return this.pinForm.get(campo)?.valid || !this.submitedPinParental;
  }

  validarFecha(){
    var hoy = new Date();
    var fecha1 = this.facturaForm.get('fecha_nacimiento')?.value;
    var fecha1 = fecha1.split("-");

    var anyhoy = hoy.getFullYear();
    var meshoy = hoy.getMonth() +1;
    var diahoy = hoy.getDate();

    if (fecha1[0] < anyhoy){
        return true;
    }
    else{
        if (fecha1[0] == anyhoy && fecha1[1] < meshoy){
          return true;
        }
        else{
            if (fecha1[0] == anyhoy && fecha1[1] == meshoy && fecha1[2] < diahoy){
              return true;
            }
            else{
                if (fecha1[0] == anyhoy && fecha1[1] == meshoy && fecha1[2] == diahoy){
                  return true;
                }
                else{
                  return false;
                }
            }
        }
    }
  }

  cargarListaProvincias() {
    if(!this.provinciasCargadas) {
      this.facturacionService.cargarProvincias().subscribe({
        next: (res: any) => {
          this.listaProvincias.push(res);
        },
        complete: () => {
          this.provinciasCargadas = true;
        }
      });
    }
  }

  cargarListaPaises() {
    if(!this.paisesCargados) {
      this.facturacionService.cargarPaises().subscribe({
        next: (res: any) => {
          this.listaPaises.push(res);
        },
        complete: () => {
          this.paisesCargados = true;
        }
      });
    }
  }

  checarSiSonIguales():  boolean  {
    if((!this.sonIguales())  &&
    this.pswForm.controls['nuevopassword'].dirty &&
    this.pswForm.controls['nuevopassword2'].dirty){
      return false;
    }
    return  true;
  }

  sonIguales(): boolean {
    let pass = this.pswForm.controls['nuevopassword'].value;
    let pass2 = this.pswForm.controls['nuevopassword2'].value;
    return pass === pass2;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

}
