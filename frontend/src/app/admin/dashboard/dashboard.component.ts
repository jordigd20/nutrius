import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilService } from '../../services/perfil.service';
import { PlatoService } from '../../services/plato.service';
import { PlatoPerfilService } from '../../services/platoperfil.service';
import { MenuService } from '../../services/menu.service';
import { MenuPerfilService } from 'src/app/services/menuperfil.service';
import { Perfil } from 'src/app/models/perfil.model';
import { Plato } from 'src/app/models/plato.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartType, ChartData, ChartConfiguration } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Graficas Usuarios y Perfiles
  @ViewChild('usuarios_premium') graficaUsuariosPremium: BaseChartDirective | undefined;
  @ViewChild('objetivos_perfiles') graficaObjetivosPerfiles: BaseChartDirective | undefined;
  @ViewChild('edades') graficaEdades: BaseChartDirective | undefined;
  @ViewChild('peso_por_edades') graficaPesos: BaseChartDirective | undefined;
  @ViewChild('altura_por_edades') graficaAltura: BaseChartDirective | undefined;
  @ViewChild('objetivos_completados') graficaObjetivosCompletados: BaseChartDirective | undefined;
  @ViewChild('sexos') graficaSexos: BaseChartDirective | undefined;
  @ViewChild('intolerancias') graficaIntolerancias: BaseChartDirective | undefined;

  // Graficas Platos
  @ViewChild('platos_comidas') graficaPlatosComidas: BaseChartDirective | undefined;
  @ViewChild('platos_gustados') graficaPlatosMasGustados: BaseChartDirective | undefined;
  @ViewChild('platos_no_gustados') graficaPlatosMenosGustados: BaseChartDirective | undefined;
  @ViewChild('platos_fallados') graficaPlatosMasFallados: BaseChartDirective | undefined;

  //Graficas Menus
  @ViewChild('menus_eficaces') graficaMenusEficaces: BaseChartDirective | undefined;
  @ViewChild('menus_fallados') graficaMenusFallados: BaseChartDirective | undefined;
  @ViewChild('menus_fecha') graficaMenusFecha: BaseChartDirective | undefined;
  @ViewChild('menus_objetivos') graficaMenusObjetivos: BaseChartDirective | undefined;

  public nombreUsuario: string = '';

  // Datos Usuarios
  public totalUsuarios: number = 0;
  public listaUsuarios: Usuario[] = [];
  public datosTotalUsuarios: ChartData<'pie', number[], string | string[]> = {
    labels: ['Usuarios normales', 'Usuarios premium'], datasets: [{ data: [],
      backgroundColor: ['#c4799d', '#5d8ed8'], hoverBorderColor: '#fff', hoverBackgroundColor: '#525F7F' }]
  };


  // Datos Perfiles
  public totalPerfiles: number = 0;
  public listaPerfiles: Perfil[] = [];
  public datosObjetivosPerfiles: ChartData<'pie', number[], string | string[]> = {
    labels: ['Perder peso', 'Ganar peso', 'Dieta saludable'], datasets: [{ data: [],
      backgroundColor: ['#c4799d', '#5d8ed8', '#e9c46a'], hoverBorderColor: '#fff', hoverBackgroundColor: '#525F7F' }]
  };
  public datosEdades: ChartData<'pie', number[], string | string[]> = {
    labels: ['3 o menos', '4', '5', '6', '7', '8', '9 o más'], datasets: [{ data: [],
      backgroundColor: ['#c4799d', '#5d8ed8', '#e9c46a', '#e76f51', '#5f5449', '#9184bb', '#a3a9a1'], hoverBorderColor: '#fff', hoverBackgroundColor: '#525F7F' }]
  };
  public datosObjetivosCompletados: ChartData<'pie', number[], string | string[]> = {
    labels: ['No han conseguido su objetivo', 'Han conseguido su objetivo'], datasets: [{ data: [],
      backgroundColor: ['#c4799d', '#5d8ed8'], hoverBorderColor: '#fff', hoverBackgroundColor: '#525F7F' }]
  };
  public datosPesosPorEdad: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Peso medio por edad',
    backgroundColor: '#c4799d', hoverBackgroundColor: '#525F7F' }]
  }
  public datosAlturaPorEdad: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Altura media por edad',
    backgroundColor: '#5d8ed8', hoverBackgroundColor: '#525F7F' }]
  }
  public datosSexos: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Perfiles por sexo',
    backgroundColor: '#e9c46a', hoverBackgroundColor: '#525F7F' }]
  }
  public datosIntolerancias: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Intolerancias',
    backgroundColor: '#e76f51', hoverBackgroundColor: '#525F7F' }]
  }

  // Datos Platos
  public totalPlatos: number = 0;
  public listaPlatos: Plato[] = [];
  public infoTotalPlatos: Map<string, any> = new Map(); // Guarda para cada plato ["plato" => { veces_gustado: X, veces_no_gustado: X, veces_fallado: X}]
  public datosPlatosComidas: ChartData<'pie', number[], string | string[]> = {
    labels: ['Desayuno', 'Almuerzo', 'Comida', 'Merienda', 'Cena'], datasets: [{ data: [],
      backgroundColor: ['#c4799d', '#5d8ed8', '#e9c46a', '#e76f51', '#5f5449'], hoverBorderColor: '#fff', hoverBackgroundColor: '#525F7F' }]
  };
  public datosPlatosMasGustados: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Platos más gustados',
    backgroundColor: '#c4799d', hoverBackgroundColor: '#525F7F' }]
  };
  public datosPlatosMenosGustados: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Platos menos gustados',
    backgroundColor: '#5d8ed8', hoverBackgroundColor: '#525F7F' }]
  };
  public datosPlatosMasFallados: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Platos más fallados',
    backgroundColor: '#e9c46a', hoverBackgroundColor: '#525F7F' }]
  };


  // Datos Menus
  public totalMenus: number = 0;
  public listaMenus: Plato[] = [];
  public infoTotalMenus: Map<string, any> = new Map();
  public datosMenusEficaces: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Eficacia menús',
    backgroundColor: '#e76f51', hoverBackgroundColor: '#525F7F' }]
  };
  public datosMenusFallados: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Comidas falladas',
    backgroundColor: '#5f5449', hoverBackgroundColor: '#525F7F' }]
  };
  public datosMenusFecha: ChartData<'pie', number[], string | string[]> = {
    labels: ['Invierno', 'Primavera', 'Verano', 'Otoño'], datasets: [{ data: [],
      backgroundColor: ['#c4799d', '#5d8ed8', '#e9c46a', '#e76f51'], hoverBorderColor: '#fff', hoverBackgroundColor: '#525F7F' }]
  };
  public datosMenusObjetivos: ChartData<'pie', number[], string | string[]> = {
    labels: ['Perder peso', 'Ganar peso', 'Dieta saludable'], datasets: [{ data: [],
      backgroundColor: ['#c4799d', '#5d8ed8', '#e9c46a'], hoverBorderColor: '#fff', hoverBackgroundColor: '#525F7F' }]
  };

  // Configuración Graficas
  public graficaBarras: ChartType = 'bar';
  public graficaCircular: ChartType = 'pie';
  public graficaPlugins = [DatalabelsPlugin];
  public optGraficaBarras: ChartConfiguration['options'] = {
    responsive: true,
    scales: { y: { ticks: { precision: 0 } } },
    plugins: { legend: { display: true, position: 'top' } },
  };
  public optGraficaCircular: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true, position: 'top' },
      datalabels: {
        color: '#fff',
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    },
  };

  constructor(private usuarioService: UsuarioService,
              private perfilService: PerfilService,
              private platoService: PlatoService,
              private platoPerfilService: PlatoPerfilService,
              private menuService: MenuService,
              private menuPerfilService: MenuPerfilService) { }

  ngOnInit(): void {
    this.usuarioService.cargarUsuario( this.usuarioService.uid ).subscribe( (res: any) => {
      this.nombreUsuario = res.usuarios['nombre_usuario'];
    });

    this.usuarioService.cargarUsuarios(0, '', 0).subscribe( (res: any) => {
      this.totalUsuarios = res['page'].total;
      this.listaUsuarios = res['usuarios'];

      this.cargarTiposUsuarios();
    });

    this.perfilService.cargarPerfiles('', 0).subscribe( (res: any) => {
      this.totalPerfiles = res['page'].total;
      this.listaPerfiles = res['perfiles'];

      this.cargarObjetivos();
      this.cargarEdades();
      this.cargarObjetivosCompletados();
      this.cargarSexos();
      this.cargarIntolerancias();
    });

    this.platoService.cargarPlatos(0, '', '', '', '', '', 0).subscribe( (res: any) => {
      this.totalPlatos = res['page'].total;
      this.listaPlatos = res['platos'];

      this.cargarPlatosComidas();
    });

    this.platoPerfilService.cargarPlatosPerfil(0, '', '', '', '', 0).subscribe( (res: any) => {

      // Calcula los platos mas gustados, menos gustados y mas fallados
      this.calcularInfoPlatos(res);

      const platosMasGustadosOrdenados = new Map([...this.infoTotalPlatos.entries()].sort((a, b) => b[1].veces_gustado - a[1].veces_gustado));
      const platosMenosGustadosOrdenados = new Map([...this.infoTotalPlatos.entries()].sort((a, b) => b[1].veces_no_gustado - a[1].veces_no_gustado));
      const platosMasFalladosOrdenados = new Map([...this.infoTotalPlatos.entries()].sort((a, b) => b[1].veces_fallado - a[1].veces_fallado));

      const limitePlatos = 20;
      let contador = 0;
      for (const [clave, valor] of platosMasGustadosOrdenados) {
        if(contador == limitePlatos) break;
        this.datosPlatosMasGustados.labels?.push(clave);
        this.datosPlatosMasGustados.datasets[0].data.push(valor.veces_gustado);
        contador++;
      }

      contador = 0;
      for (const [clave, valor] of platosMenosGustadosOrdenados) {
        if(contador == limitePlatos) break;
        this.datosPlatosMenosGustados.labels?.push(clave);
        this.datosPlatosMenosGustados.datasets[0].data.push(valor.veces_no_gustado);
        contador++;
      }

      contador = 0;
      for (const [clave, valor] of platosMasFalladosOrdenados) {
        if(contador == limitePlatos) break;
        this.datosPlatosMasFallados.labels?.push(clave);
        this.datosPlatosMasFallados.datasets[0].data.push(valor.veces_fallado);
        contador++;
      }

      this.graficaPlatosMasGustados?.update();
      this.graficaPlatosMenosGustados?.update();
      this.graficaPlatosMasFallados?.update();

    });

    this.menuService.cargarMenus(0, '', 0).subscribe( (res: any) => {
      this.totalMenus = res['page'].total;
      this.listaMenus = res['menus'];

      // Invierno | Primavera | Verano | Otoño
      const fechasRecomendadas = [0, 0, 0, 0];

      for(let i = 0; i < res['menus'].length; i++) {
        res['menus'][i]['fecharec'].forEach((fecha: any) => {
            if(fecha === 1) fechasRecomendadas[0]++;
            if(fecha === 3) fechasRecomendadas[1]++;
            if(fecha === 2) fechasRecomendadas[2]++;
            if(fecha === 4) fechasRecomendadas[3]++;
        });
      }

      this.datosMenusFecha.datasets[0].data = fechasRecomendadas;
      this.graficaMenusFecha?.update();


    });

    this.menuPerfilService.cargarMenusPerfil('', false, 0).subscribe( (res:any) => {

      for(let i = 0; i < res['listaMenuPerfil'].length; i++) {
        let menu = res['listaMenuPerfil'][i]['menu_id'].nombre;
        // Si el menu se repite se le suma el nuevo valor

        if(this.infoTotalMenus.has(menu)) {
          let arrayEficacias = this.infoTotalMenus.get(menu).eficacia;
          arrayEficacias.push(res['listaMenuPerfil'][i].eficacia);

          let valor = {
            eficacia: arrayEficacias,
            comidas_falladas: this.infoTotalMenus.get(menu).comidas_falladas + res['listaMenuPerfil'][i].comidas_falladas,
            objetivo: this.infoTotalMenus.get(menu).objetivo,
          }
          this.infoTotalMenus.set(menu, valor);
        } else {
          // Si es la primera vez que se recorre se añade su valor
          this.infoTotalMenus.set(menu, {
            eficacia: [res['listaMenuPerfil'][i].eficacia],
            comidas_falladas: res['listaMenuPerfil'][i].comidas_falladas,
            objetivo: res['listaMenuPerfil'][i]['menu_id'].objetivo,
          });
        }
      }

      // Perder peso | Ganar peso | Dieta saludable
      const objetivos = [0, 0, 0];

      // Calcula la media de la eficacia del menú, y ordena los menus por objetivos
      for (const [clave, valor] of this.infoTotalMenus) {
          let suma = 0;
          for(let i = 0; i < valor.eficacia.length; i++) {
            suma += valor.eficacia[i];
          }

          let media = Math.round(suma/valor.eficacia.length);

          let nuevoValor = {
            eficacia: media,
            comidas_falladas: valor.comidas_falladas,
            objetivo: valor.objetivo
          }

          if(valor.objetivo == 1) objetivos[0]++;
          else if(valor.objetivo == 2) objetivos[1]++;
          else if(valor.objetivo == 3) objetivos[2]++;

          this.infoTotalMenus.set(clave, nuevoValor);
      }

      const menusMasEficacesOrdenados = new Map([...this.infoTotalMenus.entries()].sort((a, b) => b[1].eficacia - a[1].eficacia));
      const menusFalladosOrdenados = new Map([...this.infoTotalMenus.entries()].sort((a, b) => b[1].comidas_falladas - a[1].comidas_falladas));

      for (const [clave, valor] of menusMasEficacesOrdenados) {
        this.datosMenusEficaces.labels?.push(clave);
        this.datosMenusEficaces.datasets[0].data.push(valor.eficacia);
      }

      for (const [clave, valor] of menusFalladosOrdenados) {
        this.datosMenusFallados.labels?.push(clave);
        this.datosMenusFallados.datasets[0].data.push(valor.comidas_falladas);
      }


      this.datosMenusObjetivos.datasets[0].data = objetivos;

      this.graficaMenusEficaces?.update();
      this.graficaMenusFallados?.update();
      this.graficaMenusObjetivos?.update();

    });

  }

  cargarTiposUsuarios() {
    let numUsuariosNoPremium = 0;
    let numUsuariosPremium = 0;
    for(let i = 0; i < this.listaUsuarios.length; i++) {
      if(this.listaUsuarios[i].rol === 'ROL_USUARIO')
        numUsuariosNoPremium++;
      else if (this.listaUsuarios[i].rol === 'ROL_PREMIUM')
        numUsuariosPremium++;
    }
    this.datosTotalUsuarios.datasets[0].data = [numUsuariosNoPremium, numUsuariosPremium];
    this.graficaUsuariosPremium?.update();
  }

  cargarObjetivos() {
    // [Perder peso, Ganar peso, Dieta saludable]
    const objetivos = [0, 0, 0]
    for(let i = 0;  i < this.listaPerfiles.length; i++) {
      if(this.listaPerfiles[i].objetivo === 'Bajar de peso')
        objetivos[0]++;
      else if(this.listaPerfiles[i].objetivo === 'Subir de peso')
        objetivos[1]++;
      else if(this.listaPerfiles[i].objetivo === 'Dieta saludable')
        objetivos[2]++;
    }
    this.datosObjetivosPerfiles.datasets[0].data = objetivos;
    this.graficaObjetivosPerfiles?.update();
  }


  cargarEdades() {
    // [<= 3 años | 4 años | 5 años | 6 años | 7 años | 8 años | >= 9 años]
    const edades = [0, 0, 0, 0, 0, 0, 0];
    const pesos = [0, 0, 0, 0, 0, 0, 0];
    const alturas = [0, 0, 0, 0, 0, 0, 0];
    for(let i = 0;  i < this.listaPerfiles.length; i++) {
      const fechaNacimiento = new Date(this.listaPerfiles[i].fecha_nacimiento);
      const year = fechaNacimiento.getFullYear();
      const mes = (fechaNacimiento.getMonth()+1) < 10 ? `0${fechaNacimiento.getMonth()+1}` : fechaNacimiento.getMonth()+1;
      const dia = fechaNacimiento.getDate() < 10 ? `0${fechaNacimiento.getDate()}` : fechaNacimiento.getDate();
      const edad = this.calcularEdad(`${year}/${mes}/${dia}`);

      if(edad <= 3){
        edades[0]++;
        pesos[0] = pesos[0] + this.listaPerfiles[i].peso_actual;
        alturas[0] = alturas[0] + this.listaPerfiles[i].altura_actual;
      }else if(edad === 4){
        edades[1]++;
        pesos[1] = pesos[1] + this.listaPerfiles[i].peso_actual;
        alturas[1] = alturas[1] + this.listaPerfiles[i].altura_actual;
      }else if(edad === 5){
        edades[2]++;
        pesos[2] = pesos[2] + this.listaPerfiles[i].peso_actual;
        alturas[2] = alturas[2] + this.listaPerfiles[i].altura_actual;
      }else if(edad === 6){
        edades[3]++;
        pesos[3] = pesos[3] + this.listaPerfiles[i].peso_actual;
        alturas[3] = alturas[3] + this.listaPerfiles[i].altura_actual;
      }else if(edad === 7){
        edades[4]++;
        pesos[4] = pesos[4] + this.listaPerfiles[i].peso_actual;
        alturas[4] = alturas[4] + this.listaPerfiles[i].altura_actual;
      }else if(edad === 8){
        edades[5]++;
        pesos[5] = pesos[5] + this.listaPerfiles[i].peso_actual;
        alturas[5] = alturas[5] + this.listaPerfiles[i].altura_actual;
      }else if(edad >= 9){
        edades[6]++;
        pesos[6] = pesos[6] + this.listaPerfiles[i].peso_actual;
        alturas[6] = alturas[6] + this.listaPerfiles[i].altura_actual;
      }
    }
    pesos[0] = pesos[0] / edades[0];
    alturas[0] = alturas[0] / edades[0];
    pesos[1] = pesos[1] / edades[1];
    alturas[1] = alturas[1] / edades[1];
    pesos[2] = pesos[2] / edades[2];
    alturas[2] = alturas[2] / edades[2];
    pesos[3] = pesos[3] / edades[3];
    alturas[3] = alturas[3] / edades[3];
    pesos[4] = pesos[4] / edades[4];
    alturas[4] = alturas[4] / edades[4];
    pesos[5] = pesos[5] / edades[5];
    alturas[5] = alturas[5] / edades[5];
    pesos[6] = pesos[6] / edades[6];
    alturas[6] = alturas[6] / edades[6];
    this.datosEdades.datasets[0].data = edades;
    this.graficaEdades?.update();
    this.datosPesosPorEdad.labels = ["3 años o menos", "4 años", "5 años", "6 años", "7 años", "8 años", "9 años o más"];
    this.datosPesosPorEdad.datasets[0].data = pesos;
    this.graficaPesos.update();
    this.datosAlturaPorEdad.labels = ["3 años o menos", "4 años", "5 años", "6 años", "7 años", "8 años", "9 años o más"];
    this.datosAlturaPorEdad.datasets[0].data = alturas;
    this.graficaAltura.update();


  }

  cargarObjetivosCompletados() {
    // [No ha conseguido el objetivo | Si lo ha conseguido]
    const objetivosCompletados = [0, 0];
    for(let i = 0;  i < this.listaPerfiles.length; i++) {
      // Si el objetivo es Dieta saludable no hay peso objetivo
      if(this.listaPerfiles[i].objetivo === 'Dieta saludable') continue;
      if(this.listaPerfiles[i].objetivo === 'Perder peso' && this.listaPerfiles[i].peso_actual <= this.listaPerfiles[i].peso_objetivo) {
        objetivosCompletados[1]++;
      } else if(this.listaPerfiles[i].objetivo === 'Ganar peso' && this.listaPerfiles[i].peso_actual >= this.listaPerfiles[i].peso_objetivo){
        objetivosCompletados[1]++;
      } else {
        // No se ha conseguido el objetivo
        objetivosCompletados[0]++;
      }
    }
    this.datosObjetivosCompletados.datasets[0].data = objetivosCompletados;
    this.graficaObjetivosCompletados?.update();
  }

  cargarSexos(){
                  //Niño, Niña
    const sexos = [0, 0];
    for(let i = 0; i < this.listaPerfiles.length; i++){
      if(this.listaPerfiles[i].sexo === 'NIÑO'){
        sexos[0]++;
      }else if(this.listaPerfiles[i].sexo === 'NIÑA'){
        sexos[1]++;
      }
    }
    this.datosSexos.labels = ["NIÑO", "NIÑA"];
    this.datosSexos.datasets[0].data = sexos;
    this.graficaSexos.update();
  }

  cargarIntolerancias(){
    //[cacahuetes, crustaceos, gluten, huevos, lacteos, moluscos, pescado]
    const intolerancias = [0, 0, 0, 0, 0, 0, 0];
    for(let i = 0; i < this.listaPerfiles.length; i++){
      for(let j = 0; j < this.listaPerfiles[i].intolerancias.length; j++){
        if(this.listaPerfiles[i].intolerancias[j] === "cacahuetes"){
          intolerancias[0]++;
        }else if(this.listaPerfiles[i].intolerancias[j] === "crustaceos"){
          intolerancias[1]++;
        }else if(this.listaPerfiles[i].intolerancias[j] === "gluten"){
          intolerancias[2]++;
        }else if(this.listaPerfiles[i].intolerancias[j] === "huevos"){
          intolerancias[3]++;
        }else if(this.listaPerfiles[i].intolerancias[j] === "lacteos"){
          intolerancias[4]++;
        }else if(this.listaPerfiles[i].intolerancias[j] === "moluscos"){
          intolerancias[5]++;
        }else if(this.listaPerfiles[i].intolerancias[j] === "pescado"){
          intolerancias[6]++;
        }
      }
    }
    this.datosIntolerancias.labels = ["Cacahuetes", "Crustáceos", "Gluten", "Huevos", "Lacteos", "Moluscos", "Pescado"];
    this.datosIntolerancias.datasets[0].data = intolerancias;
    this.graficaIntolerancias.update();
  }

  cargarPlatosComidas() {
    // [Desayuno, Almuerzo, Comida, Merienda, Cena]
    const comidas = [0, 0, 0, 0, 0];
    for(let i = 0;  i < this.listaPlatos.length; i++) {
      if(this.listaPlatos[i].comida.includes('Desayuno')) comidas[0]++;
      if(this.listaPlatos[i].comida.includes('Almuerzo')) comidas[1]++;
      if(this.listaPlatos[i].comida.includes('Comida')) comidas[2]++;
      if(this.listaPlatos[i].comida.includes('Merienda')) comidas[3]++;
      if(this.listaPlatos[i].comida.includes('Cena')) comidas[4]++;
    }
    this.datosPlatosComidas.datasets[0].data = comidas;
    this.graficaPlatosComidas?.update();
  }

  calcularInfoPlatos(res: any) {
    for(let i = 0; i < res['platosPerfil'].length; i++) {
      let plato_id = res['platosPerfil'][i]['plato_id'].nombre;
      // Si el plato se repite se le suma el nuevo valor
      if(this.infoTotalPlatos.has(plato_id)) {
        let valor = {
          veces_gustado: this.infoTotalPlatos.get(plato_id).veces_gustado + res['platosPerfil'][i].veces_gustado,
          veces_no_gustado: this.infoTotalPlatos.get(plato_id).veces_no_gustado + res['platosPerfil'][i].veces_no_gustado,
          veces_fallado: this.infoTotalPlatos.get(plato_id).veces_fallado + res['platosPerfil'][i].veces_fallado,
        }
        this.infoTotalPlatos.set(plato_id, valor);
      } else {
        // Si es la primera vez que se recorre se añade su valor
        this.infoTotalPlatos.set(plato_id, {
          veces_gustado: res['platosPerfil'][i].veces_gustado,
          veces_no_gustado: res['platosPerfil'][i].veces_no_gustado,
          veces_fallado: res['platosPerfil'][i].veces_fallado,
        });
      }
    }
  }

  calcularEdad(fechaString: string): number {
    let hoy = new Date();
    let fechaNacimiento = new Date(fechaString);
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    let m = hoy.getMonth() - fechaNacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad;
  }

  logout(): void {
    this.usuarioService.logout();
  }

}
