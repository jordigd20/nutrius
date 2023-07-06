export const imagenConSrc = async(cadena:string): Promise<HTMLImageElement> =>{
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => {
        resolve(imagen);
    }
    imagen.src = cadena;
});
}
