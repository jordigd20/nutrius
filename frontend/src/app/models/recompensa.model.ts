export class Recompensa {

  constructor(
      public nombre: string,
      public uid: string,
      public puntos: number,
      public canjeada: boolean,
      public pid: string,
      public canjeable: boolean,
      public dias: number
  )
  {}

}
