
export class Usuario {

  constructor(
    public uid: string,
    public rol: string,
    public nombre_usuario?: string,
    public email?: string,
    public perfiles?: any[],
    public password?: string,
    public pin_parental?: number
    ) {}
}
