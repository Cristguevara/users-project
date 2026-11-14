/**
 * Envoltorio de respuesta que simula el contrato de un backend real.
 *
 * Igual que en un microservicio típico, el servidor no devuelve el dato "pelado"
 * sino un sobre con metadatos (`code`, `message`) y el `data` tipado. Los mocks
 * de este proyecto responden con esta forma para que el día que exista un
 * backend real NADA cambie en la capa de dominio ni de presentación.
 */
export interface SuccessResponse<T> {
  code: string;
  message: string;
  data: T;
}
