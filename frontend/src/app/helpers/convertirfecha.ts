export const convertirFecha = async(datecita: Date) =>{
  let year = datecita.getFullYear().toString();
  let month = datecita.getMonth()+1;
  let dt = datecita.getDate();
  let stringo= '';

  if (dt < 10) {
    stringo += '0' + dt.toString();
  }else{
    stringo += dt.toString();
  }
  stringo+='/';
  if (month < 10) {
    stringo += '0' + month.toString();
  }else{
    stringo += month.toString();
  }
  stringo+='/'+year.toString();
  return stringo;
}

export const calcularEdad = async(datecita: Date) =>{
  let fechanac = new Date(datecita);
  let hoy = new Date();
  var age = hoy.getFullYear() - fechanac.getFullYear();
  var m = hoy.getMonth() - fechanac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fechanac.getDate()))
  {
      age--;
  }
  return age;
}
