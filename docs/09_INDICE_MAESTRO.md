# OmniFlow - Indice de documentacion

## Referencias principales

| Documento | Contenido |
| --- | --- |
| [README](../README.md) | Presentacion, funciones, inicio local y accesos rapidos |
| [Resumen tecnico de entrega](00_ESTADO_ACTUAL.md) | Alcance, arquitectura, deuda residual y criterios de entrega |
| [Changelog](../CHANGELOG.md) | Evolucion funcional consolidada y cambios por version |

## Guias funcionales

| Documento | Contenido |
| --- | --- |
| [Flujos detallados](01_FLUJOS_DETALLADOS.md) | Login, roles, tareas, alertas y Realtime |
| [Manual de uso por roles](03_GUIA_ROLES.md) | Funciones de administración, supervisión y usuario |

## Guias tecnicas y de validacion

| Documento | Contenido |
| --- | --- |
| [Instalacion y despliegue](06_INSTALACION_DEPLOYMENT.md) | Preparacion local y despliegue |
| [Esquema y flujos de Supabase](SUPABASE_ESQUEMA_Y_FLUJOS.md) | Esquema, relaciones, RLS, Storage y Realtime |
| [Migracion de Supabase](../migration/README.md) | Snapshot, migraciones y configuracion de entorno |
| [Usuarios iniciales](USUARIOS_INICIALES.md) | Cuentas y relaciones iniciales, sin contrasenas |
| [Validacion rapida](11_GUIA_VALIDACION_RAPIDA.md) | Comprobaciones de interfaz, login y roles |
| [Visibilidad y acceso](12_VALIDACION_VISIBILIDAD_ACCESO.md) | Casos para validar permisos por rol |
| [Auditoria de dependencias](13_VULNERABILIDADES_ACTUALES.md) | Resultados fechados de `npm audit` |

## Mantenimiento documental

- Mantener este indice sincronizado con los documentos existentes.
- Contrastar rutas y roles con `src/pages` y permisos con la implementacion.
- Actualizar la version desde `package.json`; fechar los resultados de
  validaciones y auditorias.
- Mantener secretos y contrasenas fuera del repositorio.
