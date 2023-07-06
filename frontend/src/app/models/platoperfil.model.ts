import { Plato } from "./plato.model";

export class PlatoPerfil {

  constructor(
      public _id: string,
      public perfil_id: string,
      public plato_id: Plato,
      public veces_gustado: number,
      public veces_no_gustado: number,
      public veces_fallado: number,
      public info_plato: any[],
      public puntos: number,
      public completada: boolean,
  )
  {}

}
