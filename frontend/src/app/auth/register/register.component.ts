import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

declare const gapi: any;
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public registerForm = this.fb.group({
    usuario: ['', Validators.required ],
    email: ['', [ Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    confirmarPassword: ['', Validators.required ],
    checkbox: [false, Validators.requiredTrue],
    token: ['']

  });

  public dataForm = this.fb.group({
    nombre_usuario: [''],
    email: ['', [ Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    token: ['', Validators.required]
  });

  public formSubmit = false;
  public waiting = false;

  public auth2: any;


  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private router: Router,
              private zone: NgZone,) { }

  ngOnInit(): void {
    this.renderButton();
  }

  renderButton() {
    this.startApp();
  }

  startApp() {
    gapi.load('auth2', () => {
      const client_id = environment.client_id;
      this.auth2 = gapi.auth2.init({
        client_id,
        cookiepolicy: 'single_host_origin'
      });
      this.attachSignin(document.getElementById('my-signin2'));
    });
  };

  attachSignin(element: any) {

    this.auth2.attachClickHandler(element, {},
        (googleUser: any) => {
          this.dataForm.controls['nombre_usuario'].setValue(googleUser.getBasicProfile().getName());
          this.dataForm.controls['email'].setValue(googleUser.getBasicProfile().getEmail());

          let pass = "";
          for (let i=0; i < 16; i++){
            pass += String.fromCharCode((Math.floor((Math.random() * 100)) % 94) + 33);
          }
          this.dataForm.controls['password'].setValue(pass);
          let id_token = googleUser.getAuthResponse().id_token;
          this.dataForm.controls['token'].setValue(id_token);
          this.usuarioService.registroGoogle(this.dataForm.value)
          .subscribe( (res: any) => {
            this.zone.run(() => {
              this.router.navigateByUrl('/inicio/crear-perfil');
            });
          }, (err) => {
            console.error(err);
            const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
            Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
          });
        }, function(error: any) {
          alert(JSON.stringify(error, undefined, 2));
        });
  }

  register() {
    this.formSubmit = true;
    this.waiting = true;

    if (!this.registerForm.valid) {
      return;
    }

    if(this.registerForm.controls['checkbox']){
      this.dataForm.controls['nombre_usuario'].setValue(this.registerForm.controls['usuario'].value);
      this.dataForm.controls['email'].setValue(this.registerForm.controls['email'].value);
      this.dataForm.controls['password'].setValue(this.registerForm.controls['password'].value);
      this.waiting = true;
      this.usuarioService.registrarUsuario(this.dataForm.value)
      .subscribe(
        (res: any) => {
          this.registerForm.controls['token'].setValue(res['token']);
          this.usuarioService.enviarEmail(this.registerForm.value)
          .subscribe( (res) => {
            this.waiting = false;
            this.router.navigateByUrl(`/verification/validar/${this.registerForm.controls['email'].value}`);
          }, (err) => {
            this.waiting = false;
          });
        },
        (err) => {
          const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
          this.waiting = false;
        }
      );


    }

  }

  sonIguales(): boolean {
    let pass = this.registerForm.controls['password'].value;
    let pass2 = this.registerForm.controls['confirmarPassword'].value;
    return pass === pass2;
  }

  checarSiSonIguales():  boolean  {
    if((!this.sonIguales())  &&
    this.registerForm.controls['password'].dirty &&
    this.registerForm.controls['confirmarPassword'].dirty){
      return false;
    }
    return  true;
  }

  campoValido(campo: string) {
    return this.registerForm.get(campo)?.valid || !this.formSubmit;
  }

}
