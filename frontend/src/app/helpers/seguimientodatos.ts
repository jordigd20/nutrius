import { Chart } from "chart.js";
import { firstValueFrom } from "rxjs";
import { PlatoPerfil } from "../models/platoperfil.model";
import { Seguimiento } from "../models/seguimiento.model";
import { PlatoPerfilService } from '../services/platoperfil.service';
import { PlatoService } from '../services/plato.service';
import listaElementos from 'src/assets/json/elementos.json';
import { PerfilService } from '../services/perfil.service';

export const platosConsumidos = async (res:any) => {

  let platosConsumidos: PlatoPerfil[] = [];

  if(res['resultados']){
    // Devuelve los platos pero con la fecha cambiada de formato
    platosConsumidos = res['resultados'].map( (listaPlatos: any) => {

      listaPlatos.info_plato.map( (infoplato: any) => {
        const fecha = new Date(infoplato.fecha);
        const dia = fecha.getDate() < 10 ? `0${fecha.getDate()}` : fecha.getDate();
        const mes = fecha.getMonth() < 10 ? `0${fecha.getMonth()}` : fecha.getMonth();
        infoplato.fecha = `${dia}/${mes}/${fecha.getFullYear()}`
        return infoplato;
      });

     return listaPlatos;
    });
  }
    return platosConsumidos;

}

export const nombreConsumidos = async (platoPerfil:PlatoPerfil[],platoService:PlatoService) => {
  let nombreConsumidos = [];
  for(let i=0; i<platoPerfil.length; i++){
    const res2: any = await firstValueFrom(platoService.cargarPlato(platoPerfil[i].plato_id.uid));
    if(res2['platos']){
      nombreConsumidos[i] = res2['platos'].nombre;
    }
  }
  return nombreConsumidos;
}

export const nombrePlato = async (platoPerfil:PlatoPerfil,platoService:PlatoService) => {
  let nombreConsumidos = '';
    const res2: any = await firstValueFrom(platoService.cargarPlato(platoPerfil.plato_id.uid));
    if(res2['platos']){
      nombreConsumidos = res2['platos'].nombre;
    }
  return nombreConsumidos;
}

export const comidasHoy = async (res:any,platoPerfilService:PlatoPerfilService) => {

  let comidasCompletadasHoy = [
    { comida: 'Desayuno', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Almuerzo', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Comida', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Merienda', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Cena', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
  ];

  const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaActual = new Date().getDay();
  const hoy = diaSemana[diaActual];

  res['listaMenuPerfil'].sort((a: any, b: any) => a.semana - b.semana);
  const elementos: any = listaElementos;
  const menuActual = res['listaMenuPerfil'].length - 2;

  for(let i=0; i<elementos[2].elementos.length; i++){
    const datos = res['listaMenuPerfil'][menuActual]['menusem'][hoy]['comidas'][elementos[2].elementos[i].propiedad];
    const idPlatoPerfil = datos.platos[datos.platos.length - 1].plato;
    const res2: any = await firstValueFrom(platoPerfilService.cargarPlatoPerfil(idPlatoPerfil));

    const imagen = res2['platosPerfil']['plato_id'].imagen ? res2['platosPerfil']['plato_id'].imagen : 'noimage.jpg';
    comidasCompletadasHoy[i] = {
      comida: elementos[2].elementos[i].nombre,
      completada: datos.completada,
      img: `../../../assets/img/platos/${imagen}`
    }

  }

  return comidasCompletadasHoy;
}

export const cargarChartPeso = async(perfPesoAct:number,perfEdad:number,perfSexo:number,dos:string) =>{
  let datasetsPeso= [
    {
      label: '97',
      data: [19, 22, 26, 30.5, 35, 40.5, 46],
      pointBackgroundColor: 'rgba(213, 17, 17, 0.2)', //rojo
      pointBorderColor: 'rgba(213, 17, 17, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(213, 17, 17, 0.2)',
      borderColor: 'rgba(213, 17, 17, 1)',
      borderWidth: 1,
      order: 2
    },
    {
      label: '85',
      data: [16.7, 19.3, 22.5, 26.2, 30, 33.8, 38.4],
      pointBackgroundColor: 'rgba(255, 159, 64, 0.2)', //naranja
      pointBorderColor: 'rgba(255, 159, 64, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 0.8,
      order: 2
    },
    {
      label: '50',
      data: [15, 17, 19.5, 22, 25, 28.2, 32],
      pointBackgroundColor: 'rgba(22, 165, 27, 0.2)', //verde
      pointBorderColor: 'rgba(22, 165, 27, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(22, 165, 27, 0.2)',
      borderColor: 'rgba(22, 165, 27, 1)',
      borderWidth: 1,
      order: 2
    },
    {
      label: '15',
      data: [13.2, 15, 17.2, 19.2, 21.8, 24, 26.9],
      pointBackgroundColor: 'rgba(255, 159, 64, 0.2)', //naranja
      pointBorderColor: 'rgba(255, 159, 64, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 0.8,
      order: 2
    },
    {
      label: '3',
      data: [12, 14, 15, 16, 18, 21.5, 23.5],
      pointBackgroundColor: 'rgba(213, 17, 17, 0.2)', //rojo
      pointBorderColor: 'rgba(213, 17, 17, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(213, 17, 17, 0.2)',
      borderColor: 'rgba(213, 17, 17, 1)',
      borderWidth: 1,
      order: 2
    },
    {
      label: 'Peso actual',
      data: [null, perfPesoAct],
      pointBackgroundColor: 'rgba(0, 0, 0, 1)', //negro
      pointBorderColor: 'rgba(0, 0, 0, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(0, 0, 0, 1)',
      borderColor: 'rgba(0, 0, 0, 1)',
      borderWidth: 1,
      pointRadius: 4,
      order: 1,
      spanGaps: false
    }
  ]

  //calcular punto actual segun edad
  let pesAct = [];
  let altAct = [];
  for(var i=3; i<perfEdad; i++){
    pesAct.push(null);
    altAct.push(null);
  }
  pesAct.push(perfPesoAct);

  datasetsPeso[5].data = pesAct;

  if(perfSexo==2){ //niña
    //peso
    datasetsPeso[0].data =[19, 22, 25, 29, 34, 39, 45]; //97
    datasetsPeso[1].data =[16.7, 19.2, 22.2, 25.2, 29.2, 33.2, 38.2]; //85
    datasetsPeso[2].data =[15, 17, 19, 21.5, 24.5, 28, 32]; //50
    datasetsPeso[3].data =[13, 14.8, 16.6, 18.6, 20.8, 23.6, 26.7]; //15
    datasetsPeso[4].data =[12, 13.5, 15, 16.5, 18.5, 20.5, 23]; //3
  }

  return new Chart('chartPeso'+dos, {
    type: 'line',
    data: {
      labels: ['3', '4', '5', '6', '7', '8', '9'],
      datasets: datasetsPeso
    },
    options: {
        scales: {
            y: {
                title: { display: true,
                        align: 'center',
                        text: 'Peso (kg)',
                        color: 'black',
                        padding: 5
                       }
            },
            x: {
              title: { display: true,
                      align: 'center',
                      text: 'Edad (años)',
                      color: 'black',
                      padding: 5
                     }
            }
        }
    }
  });

}

export const cargarChartAltura = async(perfAltAct:number,perfEdad:number,perfSexo:number,dos:string) =>{
  let datasetsAltura= [
    {
      label: '97',
      data: [103, 112, 119.5, 126.5, 133, 139.5, 146],
      pointBackgroundColor: 'rgba(213, 17, 17, 0.2)', //rojo
      pointBorderColor: 'rgba(213, 17, 17, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(213, 17, 17, 0.2)',
      borderColor: 'rgba(213, 17, 17, 1)',
      borderWidth: 1,
      order: 2
    },
    {
      label: '85',
      data: [100, 108.2, 115.2, 122, 128, 134.5, 140.5],
      pointBackgroundColor: 'rgba(255, 159, 64, 0.2)', //naranja
      pointBorderColor: 'rgba(255, 159, 64, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 0.8,
      order: 2
    },
    {
      label: '50',
      data: [96, 104.5, 111, 117, 123.2, 129, 134.5],
      pointBackgroundColor: 'rgba(22, 165, 27, 0.2)', //verde
      pointBorderColor: 'rgba(22, 165, 27, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(22, 165, 27, 0.2)',
      borderColor: 'rgba(22, 165, 27, 1)',
      borderWidth: 1,
      order: 2
    }
    ,
    {
      label: '15',
      data: [92.8, 100.2, 106.8, 112.5, 118, 123.5, 128.5],
      pointBackgroundColor: 'rgba(255, 159, 64, 0.2)', //naranja
      pointBorderColor: 'rgba(255, 159, 64, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 0.8,
      order: 2
    },
    {
      label: '3',
      data: [90, 97, 103, 108.5, 114, 118.5, 124],
      pointBackgroundColor: 'rgba(213, 17, 17, 0.2)', //rojo
      pointBorderColor: 'rgba(213, 17, 17, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(213, 17, 17, 0.2)',
      borderColor: 'rgba(213, 17, 17, 1)',
      borderWidth: 1,
      order: 2
    },
    {
      label: 'Altura actual',
      data: [null, perfAltAct],
      pointBackgroundColor: 'rgba(0, 0, 0, 1)', //negro
      pointBorderColor: 'rgba(0, 0, 0, 1)',
      pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(0, 0, 0, 1)',
      borderColor: 'rgba(0, 0, 0, 1)',
      borderWidth: 1,
      pointRadius: 4,
      order: 1,
      spanGaps: false
    }
  ]

  //calcular punto actual segun edad
  let altAct = [];
  for(var i=3; i<perfEdad; i++){
    altAct.push(null);
  }
  altAct.push(perfAltAct);

  datasetsAltura[5].data = altAct;

  if(perfSexo==2){ //niña
    //altura
    datasetsAltura[0].data =[102.5, 111, 118.5, 125.5, 132, 139, 145.5]; //97
    datasetsAltura[1].data =[99, 107, 114, 121, 127.2, 133.8, 140.2]; //85
    datasetsAltura[2].data =[95.8, 103.5, 110, 116, 122, 128, 134]; //50
    datasetsAltura[3].data =[92, 99.5, 105.8, 111, 117, 122.5, 128.5]; //15
    datasetsAltura[4].data =[89, 96, 102, 107, 112.5, 118.5, 124]; //3
  }

  return new Chart('chartAltura'+dos, {
    type: 'line',
    data: {
      labels: ['3', '4', '5', '6', '7', '8', '9'],
      datasets: datasetsAltura
    },
    options: {
        scales: {
            y: {
                title: { display: true,
                        align: 'center',
                        text: 'Altura (cm)',
                        color: 'black',
                        padding: 5
                       }
            },
            x: {
              title: { display: true,
                      align: 'center',
                      text: 'Edad (años)',
                      color: 'black',
                      padding: 5
                     }
            }
        }
    }
  });

}

export const cargarTranscPeso = async(listaSeguimiento:Seguimiento[],fechasSeg:string[],dos:string) =>{
  let dataTranscPeso = {
    labels: ['3', '4', '5', '6', '7', '8', '9'],
    datasets: [
      {
        label: 'Registros',
        data: [90, 97, 103, 108.5, 114, 118.5, 124],
        pointBackgroundColor: 'rgba(163, 13, 201, 0.2)', //lila
        pointBorderColor: 'rgba(163, 13, 201, 1)',
        pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
        backgroundColor: 'rgba(163, 13, 201, 0.2)',
        borderColor: 'rgba(163, 13, 201, 1)',
        borderWidth: 1
      }
    ]
  };

  let fechPeso = [];
  let fechFecha = [];
  for(var y=listaSeguimiento.length-1; y>=0; y--){
    fechPeso.push(listaSeguimiento[y].peso);
    fechFecha.push(fechasSeg[y]);
  }
  dataTranscPeso.datasets[0].data = fechPeso;
  dataTranscPeso.labels = fechFecha;

  return new Chart('transcPeso'+dos, {
    type: 'line',
    data: dataTranscPeso,
    options: {
        scales: {
            y: {
                title: { display: true,
                        align: 'center',
                        text: 'Peso (kg)',
                        color: 'black',
                        padding: 5
                       }
            },
            x: {
              title: { display: true,
                      align: 'center',
                      text: 'Fecha',
                      color: 'black',
                      padding: 5
                     }
            }
        }
    }
  });

}

export const cargarTranscAltura = async(listaSeguimiento:Seguimiento[],fechasSeg:string[],dos:string) =>{
  let dataTranscAltura = {
    labels: ['3', '4', '5', '6', '7', '8', '9'],
    datasets: [
      {
        label: 'Registros',
        data: [90, 97, 103, 108.5, 114, 118.5, 124],
        pointBackgroundColor: 'rgba(13, 113, 201, 0.2)', //azul
        pointBorderColor: 'rgba(13, 113, 201, 1)',
        pointHoverBorderColor: 'rgba(0, 0, 0, 1)',
        backgroundColor: 'rgba(13, 113, 201, 0.2)',
        borderColor: 'rgba(13, 113, 201, 1)',
        borderWidth: 1
      }
    ]
  };

  let fechAltura = [];
  let fechFecha = [];
  for(var y=listaSeguimiento.length-1; y>=0; y--){
    fechAltura.push(listaSeguimiento[y].altura);
    fechFecha.push(fechasSeg[y]);
  }
  dataTranscAltura.datasets[0].data = fechAltura;
  dataTranscAltura.labels = fechFecha;

  return new Chart('transcAltura'+dos, {
    type: 'line',
    data: dataTranscAltura,
    options: {
        scales: {
            y: {
                title: { display: true,
                        align: 'center',
                        text: 'Altura (cm)',
                        color: 'black',
                        padding: 5
                       }
            },
            x: {
              title: { display: true,
                      align: 'center',
                      text: 'Fecha',
                      color: 'black',
                      padding: 5
                     }
            }
        }
    }
  });

}

export const cargarPesoAltura = async (perfilService:PerfilService, idPerfil:string) => {
  let lista = [];
    const res2: any = await firstValueFrom(perfilService.cargarPesoAltura(idPerfil));
    if(res2['seguimiento']){
      lista = res2['seguimiento'];
    }
  return lista;
}
