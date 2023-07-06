export class MenuPerfil {

  constructor(
    public uid: string,
    public menuId: string,
    public nombreMenu: string,
    public perfilId: string,
    public semana: number,
    public comidas_falladas: number,
    public eficacia: number,
    public puntos_obtenidos: number,
    public fechaUso: Date,
    public menusem?: any[]
    ) {}
}
