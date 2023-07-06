import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagosService } from '../../services/pagos.service';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';
import { PremiumService } from '../../services/premium.service';
import { UsuarioService } from '../../services/usuario.service';
import { formatDate } from '@angular/common';


const popOverAnimation = trigger('popOverAnimation',
[
  transition(':enter', [
      style({ opacity: 0 }),
      animate('150ms ease-out', style({ opacity: 1 }))
    ]),
  transition(':leave',[
      style({  opacity: 1 }),
      animate('150ms ease-in', style({ opacity: 0 }))
    ])
]);

@Component({
  selector: 'app-validar-pago',
  templateUrl: './validar-pago.component.html',
  styleUrls: ['./validar-pago.component.css'],
  animations: [popOverAnimation]
})
export class ValidarPagoComponent implements OnInit {

  public loading: boolean = true;
  public pagoValido: boolean = false;
  public emailUsuario: string;
  public datosPremium: any = {
    plan: '',
    metodo_pago: 2,
    fecha_inicio: '',
    activo: true,
    subscripcion_id: ''
  }

  constructor(private usuarioService: UsuarioService,
              private pagoService: PagosService,
              private premiumService: PremiumService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    const { id } = this.route.snapshot.queryParams;

    if(!id) {
      this.router.navigateByUrl('/inicio');
    }

    this.pagoService.getPagoPaypal(id).subscribe({
      next: (resultadoPago: any) => {
        this.loading = false;

        if(resultadoPago.status === 'ACTIVE') {

          if (resultadoPago.precio == '3.99') this.datosPremium.plan = '1 mes';
          else if (resultadoPago.precio == '8.99')  this.datosPremium.plan = '3 meses';
          else if (resultadoPago.precio == '12.99') this.datosPremium.plan = '6 meses';
          else if (resultadoPago.precio == '18.99') this.datosPremium.plan = '1 año';

          this.datosPremium.subscripcion_id = id;

          this.premiumService.pagarPremium(this.usuarioService.uid, this.datosPremium).subscribe((resultadoPremium: any) => {
            const fechaInicio = new Date(resultadoPremium.planPremium.fecha_inicio);
            this.datosPremium.precio = resultadoPago.precio;
            this.datosPremium.fecha_inicio = formatDate(fechaInicio, 'dd/MM/yyyy', 'en');
            localStorage.setItem('rol', 'ROL_PREMIUM');
            this.pagoValido = true;
          });
        }
      },
      error: (err) => {
        const msgerror = err.error.msg || 'No se pudo validar el pago con PayPal, por favor, vuelve a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror, allowOutsideClick: false, allowEscapeKey: false})
        .then( (result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('/inicio/premium');
          }
        });
      }
    });

  }

}
