import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PerfilService } from '../../services/perfil.service';
import listaElementos from 'src/assets/json/elementos.json';

@Component({
  selector: 'app-navbar-seguimiento',
  templateUrl: './navbar-seguimiento.component.html',
  styleUrls: ['./navbar-seguimiento.component.css']
})
export class NavbarSeguimientoComponent implements OnInit {

  elementos: any = listaElementos;

  public idPerfil: string = '';
  public pagina: string = '';
  public paginaId: Number = 0;
  public nombrePerfil: string = '';


  constructor(private route: ActivatedRoute,
              private router: Router,
              private perfilService: PerfilService) { }

  ngOnInit(): void {
    this.idPerfil = this.route.snapshot.params['uid'];
    this.perfilService.cargarPerfil(this.idPerfil)
      .subscribe((res: any) => {
        this.nombrePerfil = res['existePerfil'].nombre;
      });
    this.pagina = this.router.url;
    this.setPaginaId();
  }

  setPaginaId(){
    let splito = this.pagina.split("/");
    if(splito[2]=='seg-comidas'){
      this.paginaId = 2;
    }
    else if(splito[2]=='seg-peso-altura'){
      this.paginaId = 3;
    }
    else{
      this.paginaId = 1;
    }
  }

}
