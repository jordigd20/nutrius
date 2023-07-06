import { Usuario } from './usuario.model';

export class Perfil {

  constructor(
      public nombre: string,
      public apellidos: string,
      public usuario: Usuario,
      public uid: string,
      public fecha_nacimiento: Date,
      public sexo: string,
      public peso_actual: number,
      public altura_actual: number,
      public peso_objetivo: number,
      public fecha_objetivo: Date,
      public objetivo: string,
      public avatar: string,
      public intolerancias: Array<string>,
      public activo: boolean,
      public puntos_ganados: number,
      public falladas: number,
      public completadas: number,
      public compradas: number,
      public porcentaje_completadas: number
  )
  {}

}
