import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PerfilService } from '../../services/perfil.service';
import { MenuPerfilService } from 'src/app/services/menuperfil.service';
import { Perfil } from 'src/app/models/perfil.model';
import { MenuPerfil } from 'src/app/models/menuperfil.model';
import { convertirFecha } from 'src/app/helpers/convertirfecha';
import { comidasHoy } from 'src/app/helpers/seguimientodatos';
import { PlatoPerfilService } from 'src/app/services/platoperfil.service';
import { ControlEventosService } from '../../services/control-eventos.service';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {

  public idPerfil: string = '';
  public perfil!: Perfil;
  public menuPerfil !: MenuPerfil;
  public imagenPlatoURL: any;
  public listaFalladas: any[] = [];
  public listaRegistros: any[] = [];
  public fechaRegistros: any[] = [];

  public listaComidasHoy: any[] = [
    { comida: 'Desayuno', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Almuerzo', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Comida', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Merienda', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Cena', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
  ];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private perfilService: PerfilService,
              private menuPerfilService: MenuPerfilService,
              private platoPerfilService: PlatoPerfilService,
              private controlEventosService: ControlEventosService,
              ) { }

  ngOnInit(): void {
    this.idPerfil = this.route.snapshot.params['uid'];
    this.imagenPlatoURL = '../assets/img/platos/';
    this.cargarComidas();
    this.cargarComidasNoCompletadas();
    this.cargarSeguimiento();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  cargarComidas() {
    this.menuPerfilService.cargarMenusPerfil(this.idPerfil).subscribe(
      async (res: any) => {
        this.listaComidasHoy = await comidasHoy(res,this.platoPerfilService);
      });
  }

  cargarComidasNoCompletadas(){
    if(this.idPerfil !== 'err'){
      this.menuPerfilService.cargarComidasNoCompletadas(this.idPerfil)
      .subscribe( (res: any) => {
        this.listaFalladas = res['newLista'];
      }, (err) => {
        console.error(err);
      });
    }
  }

  cargarSeguimiento(){
    if(this.idPerfil !== 'err'){
      this.perfilService.cargarSeguimientos(this.idPerfil)
      .subscribe( async (res: any) => {
        let cont = 0;
        for(let i = 0; i < res['seguimiento'].length && cont < 3; i++){
          let fecha = new Date(res['seguimiento'][i].fecha);
          let fec = await convertirFecha(fecha);
          res['seguimiento'][i].fecha = fec;
          this.listaRegistros.push(res['seguimiento'][i]);
          cont++;
        }
      }, (err) => {
        console.error(err);
      });
    }
  }


}
