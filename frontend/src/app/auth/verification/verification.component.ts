import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {

  public token!: string;
  public email!: string;

  public waiting = false;

  constructor(  private route: ActivatedRoute,
                private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    this.email = this.route.snapshot.params['email'];
    if(this.token !== undefined){
      this.activateUser();
    }
  }

  activateUser(){
    this.usuarioService.activarUsuario(this.token)
    .subscribe((res: any) => {
    }, (err) => {
    });
  }

  checkToken(): boolean {
    if(this.token !== ''){
      return true;
    }else{
      return false;
    }
  }

  enviar(){
    this.waiting = true;
    if(this.email !== undefined){
      this.usuarioService.reEnviarEmail(this.email)
      .subscribe((res: any) => {
        this.waiting = false;
      }, (err) => {
        this.waiting = false;
      });
    }
  }

}
