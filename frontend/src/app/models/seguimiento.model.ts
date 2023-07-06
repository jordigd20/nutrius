export class Seguimiento {

  constructor(
      public uid: string,
      public pid: string,
      public fecha: Date,
      public peso: number,
      public altura: number,
      public variacion: number,
      public difObjetivo: number
  )
  {}

}
