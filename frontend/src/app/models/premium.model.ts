export class Premium {

  constructor(
    public usuario_id: string,
    public subscripcion_id: string,
    public plan: string,
    public metodo_pago: number,
    public uid: string,
    public activo: boolean,
    public fecha_inicio?: Date,
    public duracion?: number,
    public precio?: number
    ) {}
}
