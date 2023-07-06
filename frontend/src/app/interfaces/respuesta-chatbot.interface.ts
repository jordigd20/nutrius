export interface mensaje {
    respuesta: respuesta,
    enviadoPor: string
}
export interface respuesta {
  text: string,
  quickReplies?: string[],
  cards?: card[]
}

interface card {
  title: string,
  subtitle: string,
  imageUri?: string
  buttons?: button[]
}

interface button {
  text: string,
  postback: string
}
