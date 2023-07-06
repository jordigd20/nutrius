export abstract class TRecurso{

  public nombre: String;

  constructor(){

  }

  public getNombre(): String{
    return this.nombre;
  }

  public setNombre(nom: String){
    this.nombre = nom;
  }
}
