import { Usuario } from './usuario.model';

export class Facturacion {
  constructor(
    public _id: string,
    public uid: string,
    public nombre?: string,
    public apellidos?: string,
    public fecha_nacimiento?: string,
    public dni?: string,
    public movil?: Number,
    public direccion?: string,
    public piso?: string,
    public codigo_postal?: Number,
    public poblacion?: string,
    public provincia?: string,
    public pais?: string
  )
  {}
}
