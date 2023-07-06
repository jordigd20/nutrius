import { vec3 } from 'gl-matrix';
import { TMalla } from '../motor-grafico/arbol-escena/TMalla';

export interface Modelo {
    nombre: string,
    traslacion: vec3,
    escalado: vec3,
    rotacion: vec3,
    pintar: boolean,
    tipo: string,
    zoom?: number,
    frame: number,
    repetirAnimacion?: boolean,
    mostrarAnimacion?: boolean,
    mallas?: TMalla[],
    islaActual?: boolean,
}
