// Fallback labels per dolor — only used when lead_magnet_label is missing from the render payload.
// The primary source is Claude (generated per video in the n8n workflow).

export const LEAD_MAGNET_FALLBACKS: Record<string, string> = {
  TIEMPO:
    'y te enviamos el documento con las 8 tareas que más tiempo le roban a tu negocio — y lo que implementamos para que cada una ocurra sola sin depender de una persona',
  CLIENTES:
    'y te enviamos el análisis de los 5 motivos por los que los clientes nuevos no están llegando a tu negocio — y los procesos exactos que instalamos para resolverlos',
  RESEÑAS:
    'y te enviamos el sistema que usamos para que tu negocio acumule reseñas de forma constante y suba de posición cuando alguien busca tu servicio en Google',
  AGENDA:
    'y te enviamos el mapa de los 5 puntos donde tu negocio está perdiendo prospectos antes de que compren — y la solución que instalamos para tapar cada uno',
  DIAGNÓSTICO:
    'y te enviamos el diagnóstico de los 5 puntos ciegos en el proceso de ventas de tu negocio — y lo que implementamos para cerrar cada uno',
};

export const getLeadMagnetLabel = (label: string, dolor: string): string =>
  label ||
  LEAD_MAGNET_FALLBACKS[(dolor || '').toUpperCase().trim()] ||
  '';
