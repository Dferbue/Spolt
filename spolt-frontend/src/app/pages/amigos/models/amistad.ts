import { usuario } from "./usuario"

export interface Amistad {
    estado:string,

    fecha_respuesta:string

    fecha_solicitud:string

    id_amistad:number

    id_usuario_receptor:number

    id_usuario_solicitante:number

    receptor:usuario

    solicitante:usuario
}