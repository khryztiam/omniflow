# 🚀 OmniFlow

> **Aplicación privada:** OmniFlow está dirigida a personal autorizado y no ofrece acceso público.

OmniFlow centraliza la asignación y el seguimiento de tareas operativas. Cada persona trabaja desde una vista según su rol y puede consultar avances, fechas, comentarios y evidencias en un mismo lugar.

## 🧭 Índice

- [📌 Resumen](#resumen)
- [✨ Funciones y roles](#funciones-y-roles)
- [🏗️ Arquitectura](#arquitectura)
- [🛠️ Inicio local](#inicio-local)
- [⌨️ Comandos](#comandos)
- [📚 Documentación del proyecto](#documentación-del-proyecto)
- [✅ Validación y seguridad](#validación-y-seguridad)
- [👥 Equipo y autores](#equipo-y-autores)

## Resumen

| Dato | Estado |
| --- | --- |
| Versión | `1.2.0` (candidata local) |
| Estado | Aplicación privada; candidata no publicada |
| Framework | Next.js `^16.1.0` con Pages Router |
| Interfaz | React `^18.3.0`, JavaScript y CSS Modules |
| Servicios | Supabase Auth, base de datos, Storage y Realtime |

## Funciones y roles

La aplicación permite organizar tareas, responsables, estados, prioridades, fechas, comentarios y evidencias. También incluye catálogos configurables y alertas directas de administración a usuarios.

### 🔴 Admin

- Supervisa el estado general, las estadísticas, la carga por responsable y las tareas atrasadas.
- Crea, edita y asigna tareas; administra usuarios, ubicaciones y catálogos de estados y prioridades.
- Envía alertas y consulta comentarios y evidencias de las tareas.

Guía de uso: [Manual por roles](./docs/03_GUIA_ROLES.md).

### 🟡 Supervisor

- Da seguimiento a sus tareas y a las de los usuarios que supervisa dentro de su alcance.
- Filtra tareas y puede crear o reasignar trabajo a usuarios supervisados.
- Consulta comentarios y evidencias, y gestiona la relación con sus usuarios supervisados.

Guía de uso: [Manual por roles](./docs/03_GUIA_ROLES.md).

### 🟢 User

- Consulta únicamente las tareas que tiene asignadas y su avance, estado y fechas.
- Actualiza el progreso, agrega comentarios y carga evidencias del trabajo.
- Recibe alertas de Admin y confirma su lectura.

Guía de uso: [Manual por roles](./docs/03_GUIA_ROLES.md).

El [manual de uso por roles](./docs/03_GUIA_ROLES.md) reúne las funciones
principales de cada perfil. El [resumen técnico de entrega](./docs/00_ESTADO_ACTUAL.md)
concentra la arquitectura, el alcance funcional y el estado de validación.

## Arquitectura

El proyecto usa Pages Router y organiza la aplicación en `src/pages` (páginas y API routes), `src/components`, `src/context`, `src/hooks`, `src/lib`, `src/styles` y `src/utils`.

La autenticación usa Supabase; las API routes validan identidad y permisos en servidor. Supabase también proporciona persistencia, Storage para evidencias y Realtime para cambios de tareas. Consulta los [flujos funcionales](./docs/01_FLUJOS_DETALLADOS.md) y el [esquema, relaciones y acceso a datos](./docs/SUPABASE_ESQUEMA_Y_FLUJOS.md) para el detalle.

## Inicio local

Requiere Node.js y npm, además de un proyecto Supabase configurado. Instala dependencias con `npm install`, crea `.env.local` a partir de `.env.example` y completa sus valores; inicia con `npm run dev`.

No publiques `.env.local` ni expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente. Para el aprovisionamiento de Supabase, consulta la guía de [migración del esquema](./migration/README.md).

La [guía de instalación y despliegue](./docs/06_INSTALACION_DEPLOYMENT.md) contiene pasos adicionales. Verifica los comandos en `package.json`, las variables en `.env.example` y el esquema en [la guía de migración](./migration/README.md).

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Ejecuta la compilación |
| `npm run lint` | Ejecuta ESLint sobre `src` |
| `npm test` | Ejecuta las pruebas con Vitest |

## Documentación del proyecto

Documentación por tema:

| Tema | Documento |
| --- | --- |
| Resumen técnico y estado de entrega | [Estado actual](./docs/00_ESTADO_ACTUAL.md) |
| Funciones de administración, supervisión y usuario | [Manual de uso por roles](./docs/03_GUIA_ROLES.md) |
| Flujos de login, roles y tareas | [Flujos detallados](./docs/01_FLUJOS_DETALLADOS.md) |
| Esquema Supabase, relaciones y permisos | [Esquema y flujos Supabase](./docs/SUPABASE_ESQUEMA_Y_FLUJOS.md) |
| Instalación y despliegue | [Guía de instalación](./docs/06_INSTALACION_DEPLOYMENT.md) |
| Esquema, aprovisionamiento y pendientes de migración | [Migración de Supabase](./migration/README.md) |
| Cuentas iniciales (sin contraseñas) | [Usuarios iniciales](./docs/USUARIOS_INICIALES.md) |
| Pruebas de acceso y presentación | [Validación rápida](./docs/11_GUIA_VALIDACION_RAPIDA.md) y [matriz de acceso](./docs/12_VALIDACION_VISIBILIDAD_ACCESO.md) |
| Seguridad técnica y dependencias | [Auditorías y configuración de seguridad](./docs/13_VULNERABILIDADES_ACTUALES.md) |
| Índice de documentación | [Índice maestro](./docs/09_INDICE_MAESTRO.md) |
| Cambios y evolución funcional | [Changelog](./CHANGELOG.md) |

## Validación y seguridad

Antes de integrar cambios, ejecuta `npm run lint`, `npm run build` y `npm test`. Para cambios de acceso, valida los tres roles y sus límites con las [guías de validación](./docs/11_GUIA_VALIDACION_RAPIDA.md).

## Equipo y autores

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://github.com/khryztiam.png" width="110" alt="Foto de perfil de Christian Meléndez" style="border-radius: 50%;" />
        <br /><strong>Christian Meléndez</strong><br />
        <img src="https://img.shields.io/badge/Role-Database%20%26%20Ops-2563EB?style=for-the-badge" alt="Database &amp; Ops" />
        <br /><a href="https://github.com/khryztiam"><img src="https://img.shields.io/badge/GitHub-Ver%20perfil-181717?style=for-the-badge&amp;logo=github" alt="Ver perfil de Christian en GitHub" /></a>
      </td>
      <td align="center">
        <img src="https://github.com/lilitbeth.png" width="110" alt="Foto de perfil de Elizabeth Guevara" style="border-radius: 50%;" />
        <br /><strong>Elizabeth Guevara</strong><br />
        <img src="https://img.shields.io/badge/Role-Logic%20%26%20Modules-7C3AED?style=for-the-badge" alt="Logic &amp; Modules" />
        <br /><a href="https://github.com/lilitbeth"><img src="https://img.shields.io/badge/GitHub-Ver%20perfil-181717?style=for-the-badge&amp;logo=github" alt="Ver perfil de Elizabeth en GitHub" /></a>
      </td>
      <td align="center">
        <img src="https://github.com/JokerBeast.png" width="110" alt="Foto de perfil de Angel Vega" style="border-radius: 50%;" />
        <br /><strong>Angel Vega</strong><br />
        <img src="https://img.shields.io/badge/Role-Mobile%20%26%20UX-059669?style=for-the-badge" alt="Mobile &amp; UX" />
        <br /><a href="https://github.com/JokerBeast"><img src="https://img.shields.io/badge/GitHub-Ver%20perfil-181717?style=for-the-badge&amp;logo=github" alt="Ver perfil de Angel en GitHub" /></a>
      </td>
      <td align="center">
        <img src="https://github.com/sofpoca.png" width="110" alt="Foto de perfil de Claudia Pocasangre" style="border-radius: 50%;" />
        <br /><strong>Claudia Pocasangre</strong><br />
        <img src="https://img.shields.io/badge/Role-Docs%20%26%20Management-D97706?style=for-the-badge" alt="Docs &amp; Management" />
        <br /><a href="https://github.com/sofpoca"><img src="https://img.shields.io/badge/GitHub-Ver%20perfil-181717?style=for-the-badge&amp;logo=github" alt="Ver perfil de Claudia en GitHub" /></a>
      </td>
      <td align="center">
        <img src="https://github.com/axdhran.png" width="110" alt="Foto de perfil de Adrian Hernandez" style="border-radius: 50%;" />
        <br /><strong>Adrian Hernandez</strong><br />
        <img src="https://img.shields.io/badge/Role-QA%20%26%20Testing-DC2626?style=for-the-badge" alt="QA &amp; Testing" />
        <br /><a href="https://github.com/axdhran"><img src="https://img.shields.io/badge/GitHub-Ver%20perfil-181717?style=for-the-badge&amp;logo=github" alt="Ver perfil de Adrian en GitHub" /></a>
      </td>
    </tr>
  </table>
</div>
