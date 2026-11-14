// Reglas compartidas para los catálogos de tareas (estados_tarea y prioridades)

// Nombres usados por lógica existente (trigger de cierre, pesos, filtros).
// Se permite cambiar su color, pero no renombrarlos ni eliminarlos.
export const ESTADOS_BASE = [
  'pendiente',
  'en_proceso',
  'en_revision',
  'completado',
  'detenido',
];

export const PRIORIDADES_BASE = ['baja', 'media', 'alta', 'urgente'];

const REGEX_COLOR_HEX = /^#[0-9A-Fa-f]{6}$/;

/**
 * Normaliza el nombre al formato del catálogo: minúsculas y guiones bajos.
 * Ej: "En Espera" -> "en_espera"
 */
export function normalizarNombreCatalogo(nombre) {
  if (typeof nombre !== 'string') return '';
  return nombre.trim().toLowerCase().replace(/\s+/g, '_');
}

export function esColorHexValido(color) {
  return typeof color === 'string' && REGEX_COLOR_HEX.test(color);
}

/**
 * Traduce errores de Postgres a mensajes legibles para el admin.
 */
export function mensajeErrorCatalogo(error, entidad) {
  if (error?.code === '23505') {
    return `Ya existe ${entidad} con ese nombre.`;
  }
  if (error?.code === '23503') {
    return `No se puede eliminar: hay tareas que usan ${entidad}.`;
  }
  return error?.message || 'Error inesperado';
}
