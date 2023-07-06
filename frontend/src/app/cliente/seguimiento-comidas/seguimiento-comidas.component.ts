import { Component, OnInit, ViewChild } from '@angular/core';
import { PlatoPerfilService } from '../../services/platoperfil.service';
import { PlatoPerfil } from '../../models/platoperfil.model';
import { MenuPerfilService } from '../../services/menuperfil.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartType, ChartData, ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { platosConsumidos, comidasHoy } from '../../helpers/seguimientodatos';
import { PlatoService } from 'src/app/services/plato.service';
import { ControlEventosService } from '../../services/control-eventos.service';

@Component({
  selector: 'app-seguimiento-comidas',
  templateUrl: './seguimiento-comidas.component.html',
  styleUrls: ['./seguimiento-comidas.component.css']
})
export class SeguimientoComidasComponent implements OnInit {

  @ViewChild('grafica1') grafica1: BaseChartDirective | undefined;
  @ViewChild('grafica2') grafica2: BaseChartDirective | undefined;
  @ViewChild('grafica3') grafica3: BaseChartDirective | undefined;


  public idPerfil: string = '';
  public comidasCompletadasHoy: any[] = [
    { comida: 'Desayuno', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Almuerzo', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Comida', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Merienda', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Cena', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
  ];

  public totalPlatos: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = environment.registrosPorPagina;

  public ultimaBusqueda: string = '';
  public loadingPlatosPerfil: boolean = true;
  public platosConsumidos: PlatoPerfil[] = [];
  public debounceTimer?: NodeJS.Timeout;

  public opcionesGrafica: ChartConfiguration['options'] = {
    responsive: true,
    scales: { y: { ticks: { precision: 0 } } },
    plugins: { legend: { display: true, position: 'top' } },
  };

  public platosMasGustados: PlatoPerfil[] = [];
  public platosMenosGustados: PlatoPerfil[] = [];
  public platosMasFallados: PlatoPerfil[] = [];

  // Datos platos para las graficas
  public tipoGrafica: ChartType = 'bar';
  public datosPlatosMasGustados: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: '% Veces gustado / Veces Comido',
    backgroundColor: '#00B593', hoverBackgroundColor: '#525F7F' }]
  };
  public datosPlatosMenosGustados: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: '% Veces no gustado / Veces Comido',
    backgroundColor: '#00B593', hoverBackgroundColor: '#525F7F' }]
  };
  public datosPlatosMasFallados: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: '% Veces fallado / Veces Comido',
    backgroundColor: '#00B593', hoverBackgroundColor: '#525F7F' }]
  };

  constructor(private route: ActivatedRoute,
              private router: Router,
              private platoPerfilService: PlatoPerfilService,
              private menuPerfilService: MenuPerfilService,
              private platoService: PlatoService,
              private controlEventosService: ControlEventosService,
              ) { }

  ngOnInit() {
    let pagina = this.router.url;
    let splito = pagina.split("/");
    this.idPerfil = splito[3];
    this.cargarComidasCompletadasHoy();
    this.cargarPlatosConsumidos(this.ultimaBusqueda);
    this.cargarPlatosPerfilMasGustados();
    this.cargarPlatosPerfilMenosGustados();
    this.cargarPlatosPerfilMasFallados();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  async cargarComidasCompletadasHoy() {
    this.menuPerfilService.cargarMenusPerfil(this.idPerfil).subscribe(
    async (res: any) => {
      this.comidasCompletadasHoy = await comidasHoy(res,this.platoPerfilService);
    });
  }

  cargarPlatosConsumidos(textoBuscar: string) {
    if(this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.ultimaBusqueda = textoBuscar;
      this.loadingPlatosPerfil = true;
      this.platoPerfilService.cargarPlatosPerfilComidos(this.posicionActual, this.idPerfil, textoBuscar)
        .subscribe(async (res: any) => {
            // Se comprueba si estamos en una página vacía, si es así entonces retrocedemos una página
            if (res['resultados'].length === 0) {
              if (this.posicionActual > 0) {
                this.posicionActual = this.posicionActual - this.registrosPorPagina;
                if (this.posicionActual < 0) this.posicionActual = 0;
                this.cargarPlatosConsumidos(this.ultimaBusqueda);
              } else {
                this.platosConsumidos = [];
                this.totalPlatos = 0;
              }
            } else {
              this.platosConsumidos = await platosConsumidos(res);
              this.totalPlatos = res['page'].total;

            }
            this.loadingPlatosPerfil = false;

          }, (err) => {
            Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
            this.loadingPlatosPerfil = false;
          });
    }, 350);
  }

  cargarPlatosPerfilMasGustados() {
    this.platoPerfilService.cargarPlatosPerfilMasGustados(this.idPerfil).subscribe(
      (res: any) => {
        for(let i = 0; i < res.resultados.length; i++){
          this.platosMasGustados.push(res.resultados[i].plato_id);
          this.datosPlatosMasGustados.labels?.push(res.resultados[i].plato_id.nombre);
          this.datosPlatosMasGustados.datasets[0].data.push(res.gustados[i].totalGustado);
        }

        this.grafica1?.update();
      });
    }

  cargarPlatosPerfilMenosGustados() {
    this.platoPerfilService.cargarPlatosPerfilMenosGustados(this.idPerfil).subscribe(
      (res: any) => {
        for(let i = 0; i < res.resultados.length; i++){
          this.platosMenosGustados.push(res.resultados[i].plato_id);
          this.datosPlatosMenosGustados.labels?.push(res.resultados[i].plato_id.nombre);
          this.datosPlatosMenosGustados.datasets[0].data.push(res.no_gustados[i].totalNoGustado);
        }

        this.grafica2?.update();
    });
  }

  cargarPlatosPerfilMasFallados() {
    this.platoPerfilService.cargarPlatosPerfilMasFallados(this.idPerfil).subscribe(
      (res: any) => {
        for(let i = 0; i < res.resultados.length; i++){
          this.platosMasFallados.push(res.resultados[i].plato_id);
          this.datosPlatosMasFallados.labels?.push(res.resultados[i].plato_id.nombre);
          this.datosPlatosMasFallados.datasets[0].data.push(res.fallados[i].totalFallado);
        }

        this.grafica3?.update();
    });
  }

  cambiarPagina( pagina: number ){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarPlatosConsumidos(this.ultimaBusqueda);
  }

}
