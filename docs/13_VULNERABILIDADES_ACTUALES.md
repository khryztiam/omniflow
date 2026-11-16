# OmniFlow - Auditoría de dependencias

**Fecha de revisión:** 15 de noviembre de 2026
**Fuente:** `npm audit` y `npm audit --omit=dev`, sobre el lockfile actual.
**Dependencias actualizadas durante esta revisión:** ninguna.

## Resumen

| Alcance | Entradas afectadas | Críticas | Altas | Moderadas | Bajas |
| --- | ---: | ---: | ---: | ---: | ---: |
| Árbol completo | 29 | 4 | 11 | 13 | 1 |
| Producción (`--omit=dev`) | 7 | 1 | 5 | 1 | 0 |

Las cifras representan entradas de paquetes reportadas por npm; un paquete
puede agrupar más de un aviso. El audit detecta hallazgos en dependencias de
producción y de desarrollo.

## Dependencias afectadas en producción

Las versiones corresponden a `package-lock.json`.

| Paquete | Versión | Severidad | Tipo |
| --- | ---: | --- | --- |
| `next` | `16.2.4` | Crítica | Directa |
| `postcss` | `8.4.31` | Alta | Transitiva |
| `sharp` | `0.34.5` | Alta | Transitiva |
| `nanoid` | `3.3.11` | Alta | Transitiva |
| `source-map-js` | `1.2.1` | Alta | Transitiva |
| `ws` | `8.20.0` | Alta | Transitiva |
| `baseline-browser-mapping` | `2.10.19` | Moderada | Transitiva |

Entre las dependencias de desarrollo también se reportan entradas críticas en
`vitest` y `@vitest/ui`, además de avisos en `vite`, `vite-node` y otras
dependencias transitivas.

## Estado y decisión de entrega

- La auditoría anterior, fechada en abril, ya no representa el estado actual:
  reportaba siete avisos moderados y no reflejaba los hallazgos actuales.
- npm informa que hay rutas de actualización para los paquetes afectados. No
  se aplicó `npm audit fix` ni `npm audit fix --force`; la actualización debe
  hacerse de forma controlada y validar compatibilidad.
- El hallazgo crítico de `next` está en dependencias de producción. No promover
  a producción hasta actualizar dependencias y repetir la auditoría y las
  validaciones.

## Validación requerida después de actualizar

1. Repetir `npm audit` y `npm audit --omit=dev`.
2. Ejecutar `npm run lint`, `npm test -- --run` y `npm run build`.
3. Probar inicio de sesión y permisos para admin, supervisor y usuario.
4. Verificar tareas, comentarios, evidencias, alertas y Realtime en un entorno
   de prueba.

La ejecución actual de `npm test -- --run` pasó 6 pruebas en un archivo. Esta
cobertura no sustituye las validaciones funcionales por rol ni la revisión de
los avisos de dependencias.
