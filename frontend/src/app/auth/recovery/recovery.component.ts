import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.css']
})
export class RecoveryComponent implements OnInit {

  public recoveryForm = this.fb.group({
    email: [localStorage.getItem('email') || '', [ Validators.required, Validators.email] ],
  });
  public recoveryPassForm = this.fb.group({
    password: ['', Validators.required ],
    confirmarPassword: ['', Validators.required ],
    email: ['', [ Validators.required, Validators.email] ],
  });

  public email!: string;
  public waiting = false;
  public formSubmit = false;
  public enviado = false;
  public recuperar = false;

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.email = this.route.snapshot.params['email'];
    if(this.email !== undefined){
      this.recuperar = true;
    }
  }

  enviarEmail(){
    this.waiting = true;
    this.usuarioService.enviarEmail(this.recoveryForm.value)
    .subscribe( (res) => {
      this.waiting = false;
      this.enviado = true;
    }, (err) => {
      console.error(err);
      this.waiting = false;
    });
  }

  restablecer(){
    this.formSubmit = true;
    this.waiting = true;
    this.recoveryPassForm.controls['email'].setValue(this.email);
    this.usuarioService.restablecerPassword(this.recoveryPassForm.value)
    .subscribe(( res: any) => {
      this.waiting = false;
      Swal.fire({icon: 'success', title: 'Hecho!', text: 'Contraseña Cambiada'
      }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('/login');
          }
      });
    }, (err) => {
      console.error(err);
      this.waiting = false;
    });
  }

  campoValido(campo: string) {
    return this.recoveryPassForm.get(campo)?.valid || !this.formSubmit;
  }

  sonIguales(): boolean {
    let pass = this.recoveryPassForm.controls['password'].value;
    let pass2 = this.recoveryPassForm.controls['confirmarPassword'].value;
    return pass === pass2;
  }

  checarSiSonIguales():  boolean  {
    if((!this.sonIguales())  &&
    this.recoveryPassForm.controls['password'].dirty &&
    this.recoveryPassForm.controls['confirmarPassword'].dirty){
      return false;
    }
    return  true;
  }

}
