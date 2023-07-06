import { Component, OnInit, ViewChildren, QueryList, ElementRef, NgZone } from '@angular/core';
import { FacturacionService } from '../../services/facturacion.service';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { formatDate } from '@angular/common';
import { Facturacion } from '../../models/facturacion.model';
import { PagosService } from '../../services/pagos.service';
import { environment } from 'src/environments/environment';
import { loadScript, PayPalNamespace } from "@paypal/paypal-js";
import { ControlEventosService } from '../../services/control-eventos.service';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css']
})
export class FacturacionComponent implements OnInit {

  @ViewChildren('botonPaypal, botonPagar') botonesPagar: QueryList<ElementRef<HTMLButtonElement>>;

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

  public premiumForm = this.fb.group({
    plan: ['', Validators.required],
    metodo_pago: [0, Validators.required],
    activo: [true, Validators.required]
  });

  public uidUsu: string = this.usuarioService.uid;
  public waiting: boolean = false;
  public submited = false;
  public hayFactura: boolean = false;
  public facturacion: Facturacion;
  public planes: any[] = [
    { nombre: 'Gratis',  tipo: 0, tiempo: '',              precio: 0, ahorrar: '0' },
    { nombre: '1 mes',   tipo: 1, tiempo: '/mes',          precio: 3.99, ahorrar: '0', descripcion: 'Plan premium por 1 mes' },
    { nombre: '3 meses', tipo: 2, tiempo: '/cada 3 meses', precio: 8.99, ahorrar: '11.92', descripcion: 'Plan premium por 3 meses' },
    { nombre: '6 meses', tipo: 3, tiempo: '/cada 6 meses', precio: 12.99, ahorrar: '21.90', descripcion: 'Plan premium por 6 meses' },
    { nombre: '1 año',   tipo: 4, tiempo: '/cada 1 año',   precio: 18.99, ahorrar: '28.89', descripcion: 'Plan premium por 1 año' },
  ];
  public planSeleccionado: any = {};
  public tipoPlan: number = 0;
  public metodoPago: number = 2;
  public paypal: PayPalNamespace;
  public listaProvincias: any[] = []
  public listaPaises: any[] = [];
  public provinciasCargadas: boolean = false;
  public paisesCargados: boolean = false;

  constructor(private usuarioService: UsuarioService,
    private facturacionService: FacturacionService,
    private pagosService: PagosService,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private controlEventosService: ControlEventosService,
    ) { }

  ngOnInit(): void {
    this.initPaypal();

    this.tipoPlan = this.route.snapshot.params['plan'];

    for(let i = 0; i < this.planes.length; i++) {
      if(this.planes[i].tipo == Number(this.tipoPlan)) {
        this.planSeleccionado = this.planes[i];
        break;
      }
    }

    if(Object.keys(this.planSeleccionado).length === 0)
      this.router.navigateByUrl('/inicio/premium');

    this.comprobarFacturacion();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  async initPaypal() {

    try {
      this.paypal = await loadScript({
        'client-id': environment.PAYPAL_CLIENT_ID,
        'data-namespace': 'paypal_sdk',
        'enable-funding': '',
        'currency': 'EUR',
        'intent': 'subscription',
        'vault': true
      });

      if (this.paypal) {

        const paypalButton = this.paypal.Buttons({
            fundingSource: this.paypal.FUNDING['PAYPAL'],
            style: {
              layout: 'vertical',
              color: 'blue',
              label: 'subscribe'
            },
            onClick: (data, actions) => {
              this.submited = true;

              if(this.facturaForm.valid) {
                this.crearActualizarFacturacion();
                return actions.resolve();
              } else {
                return actions.reject();
              }
            },
            createSubscription: (data, actions) => {

              let nuevoPlan = '';
              if(this.tipoPlan == 1) nuevoPlan = environment.PLAN_1MES_ID;
              else if (this.tipoPlan == 2) nuevoPlan = environment.PLAN_3MESES_ID;
              else if (this.tipoPlan == 3) nuevoPlan = environment.PLAN_6MESES_ID;
              else if (this.tipoPlan == 4) nuevoPlan = environment.PLAN_1AÑO_ID;

              return actions.subscription.create({
                plan_id: nuevoPlan
              });
            },
            onApprove: (data, actions) => {
              this.ngZone.run(() => {
                this.router.navigateByUrl(`/inicio/validar-pago?id=${data.subscriptionID}`);
              });
              return new Promise<void>((resolve, reject) => {});
            },
            onError: (err) => {
              const msgerror = 'No se pudo conectar con PayPal, por favor, vuelve a intentarlo';
              Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
            }
        });

        if (paypalButton.isEligible()) paypalButton.render('#boton-paypal');

      }

    } catch (error) {
        console.error('Fallo en PayPal JS SDK script', error);
    }

  }

  comprobarFacturacion() {
    this.facturacionService.cargarFactura(this.uidUsu).subscribe((res:any) =>{
      if(res['factura'] != null) this.cargarFacturacion(res['factura']);
    });
  }

  cargarFacturacion(datosFacturacion: any) {
    this.hayFactura = true;
    const fecha_nacimiento = new Date(datosFacturacion.fecha_nacimiento);

    this.facturacion = new Facturacion(
        datosFacturacion._id, datosFacturacion.uid,
        datosFacturacion.nombre, datosFacturacion.apellidos,
        formatDate(fecha_nacimiento, 'yyyy-MM-dd', 'en'), datosFacturacion.dni,
        datosFacturacion.movil, datosFacturacion.direccion,
        datosFacturacion.piso, datosFacturacion.codigo_postal,
        datosFacturacion.poblacion, datosFacturacion.provincia,
        datosFacturacion.pais
    );

    this.facturaForm.setValue({
      nombre: this.facturacion.nombre,
      apellidos: this.facturacion.apellidos,
      fecha_nacimiento: this.facturacion.fecha_nacimiento,
      dni: this.facturacion.dni,
      movil: this.facturacion.movil,
      direccion: this.facturacion.direccion,
      piso: this.facturacion.piso,
      codigo_postal: this.facturacion.codigo_postal,
      poblacion: this.facturacion.poblacion,
      provincia: this.facturacion.provincia,
      pais: this.facturacion.pais
    });

  }

  hacerPago(){
    this.submited = true;

    if(this.facturaForm.valid) {

      this.crearActualizarFacturacion();

      let nuevoPlan = '';
      if(this.tipoPlan == 1) nuevoPlan = '1 mes';
      else if (this.tipoPlan == 2) nuevoPlan = '3 meses';
      else if (this.tipoPlan == 3) nuevoPlan = '6 meses';
      else if (this.tipoPlan == 4) nuevoPlan = '1 año';

      if(this.metodoPago == 1) {
        this.pagosService.crearPagoPaypal(nuevoPlan).subscribe( (res: any) => {
          this.waiting = false;
          window.open(res.link.href); // Abrir una nueva ventana
          // window.location.href = res.link.href; // Redirigir en la misma ventana
        }, (err) => {
          const msgerror = err.error.msg || 'No se pudo conectar con PayPal, por favor, vuelve a intentarlo';
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
        });
      }

    }
  }

  crearActualizarFacturacion() {
    this.waiting = true;

    if(!this.hayFactura) {
      this.facturacionService.crearFactura(this.uidUsu, this.facturaForm.value).subscribe((res: any) => {
        this.cargarFacturacion(res['factura']);
      },
      (err) =>{
        this.waiting = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, por favor, vuelve a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
    } else {
      this.facturacionService.actualizarFact(this.facturacion._id, this.facturaForm.value).subscribe( (res: any) => {},
      (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción, por favor, vuelve a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
    }
  }

  campoValido(campo: string) {
    return this.facturaForm.get(campo)?.valid || !this.submited;
  }

  cambiarMetodoPago(metodo: number) {
    this.metodoPago = metodo;

    // Si pagar con tarjeta se activa se muestra el boton de pagar
    if(metodo == 1) {
      this.botonesPagar.first.nativeElement.style.display = 'none';
      this.botonesPagar.last.nativeElement.style.display = 'block';
    }

    // Si pagar con paypal se activa se muestra el boton de pagar con paypal
    if(metodo == 2) {
      this.botonesPagar.first.nativeElement.style.display = 'block';
      this.botonesPagar.last.nativeElement.style.display = 'none';
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
          this.listaPaises.sort();
        }
      });
    }
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

}
