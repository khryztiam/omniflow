# 🚀 OmniFlow

> **Aplicación privada:** OmniFlow está dirigida a personal autorizado y no ofrece acceso público.

OmniFlow centraliza la asignación y el seguimiento de tareas operativas. Cada persona trabaja desde una vista según su rol y puede consultar avances, fechas, comentarios y evidencias en un mismo lugar.

## 🧭 Índice

- [Resumen](#resumen)
- [Funciones y roles](#funciones-y-roles)
- [Arquitectura](#arquitectura)
- [Inicio local](#inicio-local)
- [Comandos](#comandos)
- [Documentación del proyecto](#documentación-del-proyecto)
- [Validación y seguridad](#validación-y-seguridad)
- [Historial](#historial)
- [Equipo / Autores](#equipo--autores)

## 📌 Resumen

| Dato | Estado |
| --- | --- |
| Versión | `1.1.0` |
| Estado | Aplicación privada con tres roles activos |
| Framework | Next.js `^16.1.0` con Pages Router |
| Interfaz | React `^18.3.0`, JavaScript y CSS Modules |
| Servicios | Supabase Auth, base de datos, Storage y Realtime |

## ✨ Funciones y roles

La aplicación permite organizar tareas, responsables, estados, prioridades, fechas, comentarios y evidencias. También incluye catálogos configurables y alertas directas de administración a usuarios.

### 🔴 Admin

Administra la operación global: personas, catálogos y tareas, y consulta el estado general del trabajo.

Guía de uso: [Administración](./docs/03_GUIA_ADMIN.md).

### 🟡 Supervisor

Gestiona tareas y usuarios dentro de su alcance, y da seguimiento al trabajo de su equipo.

Guía de uso: [Supervisor](./docs/05_GUIA_SUPERVISOR.md).

### 🟢 User

Consulta sus tareas asignadas, registra avances, comentarios y evidencias, y confirma alertas recibidas.

Guía de uso: [Usuario](./docs/04_GUIA_USER.md).

Las guías por rol son referencias complementarias: contrasta sus pasos con la interfaz actual y con el [estado vigente del proyecto](./docs/00_ESTADO_ACTUAL.md).

> [Nota del equipo: añadir aquí una decisión o aprendizaje concreto sobre cómo quieren organizar el seguimiento diario de tareas.]

## 🏗️ Arquitectura

El proyecto usa Pages Router y organiza la aplicación en `src/pages` (páginas y API routes), `src/components`, `src/context`, `src/hooks`, `src/lib`, `src/styles` y `src/utils`.

La autenticación usa Supabase; las API routes validan identidad y permisos en servidor. Supabase también proporciona persistencia, Storage para evidencias y Realtime para cambios de tareas. Consulta los [flujos funcionales](./docs/01_FLUJOS_DETALLADOS.md) y el [esquema, relaciones y acceso a datos](./docs/SUPABASE_ESQUEMA_Y_FLUJOS.md) para el detalle.

> [Nota del equipo: documentar aquí las decisiones de arquitectura que deban mantenerse al incorporar nuevas rutas o permisos.]

## 🛠️ Inicio local

Requiere Node.js y npm, además de un proyecto Supabase configurado. Instala dependencias con `npm install`, crea `.env.local` a partir de `.env.example` y completa sus valores; inicia con `npm run dev`.

No publiques `.env.local` ni expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente. Para el aprovisionamiento de Supabase, consulta la guía de [migración del esquema](./migration/README.md).

La [guía de instalación y despliegue](./docs/06_INSTALACION_DEPLOYMENT.md) contiene pasos adicionales, pero algunas instrucciones y ejemplos pueden no corresponder al estado actual. Verifica los comandos en `package.json`, las variables en `.env.example` y el esquema en `migration/README.md` antes de seguirlos.

## ⌨️ Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Ejecuta la compilación |
| `npm run lint` | Ejecuta ESLint sobre `src` |
| `npm test` | Ejecuta las pruebas con Vitest |

## 📚 Documentación del proyecto

El [índice maestro](./docs/09_INDICE_MAESTRO.md) reúne la documentación disponible. Atajos por tema:

| Tema | Documento |
| --- | --- |
| Estado y funcionalidades confirmadas | [Estado actual](./docs/00_ESTADO_ACTUAL.md) |
| Flujos de login, roles y tareas | [Flujos detallados](./docs/01_FLUJOS_DETALLADOS.md) |
| Esquema Supabase, relaciones y permisos | [Esquema y flujos Supabase](./docs/SUPABASE_ESQUEMA_Y_FLUJOS.md) |
| Instalación y despliegue | [Guía de instalación](./docs/06_INSTALACION_DEPLOYMENT.md) |
| Esquema, aprovisionamiento y pendientes de migración | [Migración de Supabase](./migration/README.md) |
| Cuentas iniciales (sin contraseñas) | [Usuarios iniciales](./docs/USUARIOS_INICIALES.md) |
| Pruebas de acceso y presentación | [Validación rápida](./docs/11_GUIA_VALIDACION_RAPIDA.md) y [matriz de acceso](./docs/12_VALIDACION_VISIBILIDAD_ACCESO.md) |
| Revisión de dependencias | [Vulnerabilidades registradas](./docs/13_VULNERABILIDADES_ACTUALES.md) |
| Análisis técnico y riesgos | [Evaluación técnica](./docs/10_EVALUACION_TECNICA_PROFUNDA.md), [hallazgos](./docs/02_HALLAZGOS_RECOMENDACIONES.md) y [matriz de riesgos](./docs/07_MATRIZ_RIESGOS.md) |
| Cambios por versión | [Changelog](./CHANGELOG.md) y [historial anterior](./CHANGELOG_HISTORICO.md) |

Los documentos de análisis y las guías por rol pueden conservar observaciones históricas o pasos no vigentes. Usa `docs/00_ESTADO_ACTUAL.md` y el código como referencia antes de tomar decisiones técnicas.

## ✅ Validación y seguridad

Antes de integrar cambios, ejecuta `npm run lint`, `npm run build` y `npm test`. Para cambios de acceso, valida los tres roles y sus límites con las [guías de validación](./docs/11_GUIA_VALIDACION_RAPIDA.md).

El último informe documentado de `npm audit` corresponde al 27 de abril de 2026; no debe interpretarse como un resultado actualizado. Revisa [el informe](./docs/13_VULNERABILIDADES_ACTUALES.md) y los [pendientes de seguridad de Supabase](./migration/README.md) para conocer su fecha y contexto.

## 📝 Historial

Los cambios publicados se registran en [CHANGELOG.md](./CHANGELOG.md). La línea de versiones anterior se conserva en [CHANGELOG_HISTORICO.md](./CHANGELOG_HISTORICO.md).

## 👥 Equipo / Autores

- **Christian Melendez** — Base de datos y mantenimiento técnico
- **Elizabeth Guevara** — Catálogos, permisos y gestión de tareas
- **Angel Vega** — Experiencia móvil y usabilidad
- **Claudia Pocasangre** — Organización y documentación
- **Adrian Hernandez** — Integración y pruebas de usabilidad

Si cambian las responsabilidades, actualiza este listado con el nombre y rol acordados por el equipo.
