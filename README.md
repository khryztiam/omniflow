# OmniFlow

> **Aplicación privada:** OmniFlow está dirigida a personal autorizado y no
> ofrece acceso público.

OmniFlow es una aplicación web para organizar y dar seguimiento al trabajo de
equipos operativos. Centraliza las tareas, responsables, fechas, avances y
evidencias para reducir el seguimiento disperso y dar a cada rol una vista
acorde con su alcance.

## Propósito y alcance

El proyecto busca que el equipo pueda:

- asignar y consultar tareas en un espacio común;
- distinguir responsabilidades y visibilidad para administración,
  supervisión y usuarios operativos;
- registrar avances, comentarios, evidencias y alertas;
- identificar vencimientos y carga de trabajo con mayor claridad.

El alcance actual comprende tres roles activos —admin, supervisor y user— y
flujos de tareas, catálogos, comentarios, evidencias, alertas y actualización
en tiempo real. La aplicación es privada y depende de un proyecto Supabase
configurado para el entorno correspondiente.

## Funcionalidades principales

| Rol | Aporte al flujo operativo |
| --- | --- |
| **Admin** | Visión global; gestiona usuarios, ubicaciones, catálogos, tareas y asignaciones; revisa estadísticas y puede enviar alertas. |
| **Supervisor** | Organiza tareas y personas dentro de su alcance local, y da seguimiento a avances, comentarios y evidencias. |
| **User** | Consulta sus tareas asignadas, actualiza estado y progreso, y registra comentarios y evidencias. |

Entre los avances funcionales se incluyen catálogos configurables de estados y
prioridades, evidencia adjunta a tareas, comentarios, alertas con confirmación
de lectura y actualización de vistas ante cambios en tareas.

La interfaz también incorpora ajustes de usabilidad: el desplazamiento del
menú no mueve el resto de la página, el formulario de inicio de sesión permite
mostrar u ocultar la contraseña y se actualizaron los textos de usuario y
contraseña.

## Arquitectura y componentes

| Componente | Responsabilidad |
| --- | --- |
| **Interfaz web** | Páginas de Next.js Pages Router y componentes React organizados por rol; utiliza JavaScript y CSS Modules. |
| **Autenticación y perfil** | Supabase Auth gestiona la sesión; el perfil de la aplicación aporta rol y alcance operativo. |
| **API y lógica de servidor** | Las API Routes de Next.js atienden operaciones protegidas y aplican las comprobaciones de identidad, rol y alcance descritas en la documentación técnica. |
| **Datos y archivos** | Supabase proporciona PostgreSQL, almacenamiento de evidencias y servicios de datos. |
| **Actualización de vistas** | Supabase Realtime notifica cambios para que las vistas pertinentes vuelvan a consultar información. |

El sistema combina API Routes con algunas consultas directas desde el cliente.
Las operaciones que requieren privilegios elevados se realizan en el servidor;
RLS en Supabase es una capa adicional que debe mantenerse alineada con los
permisos de la aplicación.

**Stack:** Next.js `^16.1.0` con Pages Router, React `^18.3.0`, JavaScript,
Supabase y CSS Modules.

## API

La API de OmniFlow conecta las pantallas con las operaciones de negocio y los
datos. Sus servicios principales cubren consultas y cambios de tareas por rol,
asignaciones, administración de usuarios y catálogos, además de los flujos de
comentarios, evidencias y alertas. El acceso se limita según la identidad, el
rol y el alcance del usuario; los datos se guardan en Supabase y las vistas
pueden refrescarse mediante Realtime.

Los detalles de flujos y validación de acceso están en
[Flujos detallados](./docs/01_FLUJOS_DETALLADOS.md) y
[Validación de visibilidad y acceso](./docs/12_VALIDACION_VISIBILIDAD_ACCESO.md).
El modelo de datos y su relación con sus servicios se describe en
[Esquema y flujos de Supabase](./docs/SUPABASE_ESQUEMA_Y_FLUJOS.md). No existe
un documento independiente de referencia OpenAPI en la documentación actual.

## Asistencia de IA y skills del repositorio

El repositorio incluye instrucciones y guías para orientar a agentes de
programación con IA hacia cambios pequeños, compatibles con el stack y
verificables:

- [Instrucciones para Copilot](./.github/copilot-instructions.md) establece
  convenciones del proyecto, restricciones de stack y criterios de seguridad.
- [AGENTS.md](./AGENTS.md) define el flujo de trabajo: entender el cambio,
  revisar el contexto, minimizar el alcance y validar el resultado.
- [docs/skills/](./docs/skills/) reúne siete guías temáticas: revisión de API,
  control de cambios, sincronización de documentación, UI/UX, commits, cambios
  seguros y revisión de Supabase.

Cada guía describe cuándo usarla, qué revisar, riesgos, estrategia y una lista
de validación. En conjunto, personalizan la forma de interpretar y resolver
tareas al priorizar el código existente, proteger autenticación y datos, evitar
refactors no solicitados y explicar cómo se validó el trabajo. Son documentos
de orientación para agentes, no funcionalidades ejecutables de OmniFlow. El
repositorio no registra una comparación formal del comportamiento del agente
antes de estas instrucciones ni un inventario de modelos o herramientas de IA
utilizados durante todo el desarrollo.

## Equipo y aportaciones

El desarrollo de **OmniFlow** reúne trabajo de base de datos, seguridad, experiencia
de usuario y documentación. Estas son las contribuciones realizadas por el equipo
hasta esta entrega:

### Base de datos y mantenimiento técnico - Christian Melendez

- Recreó la base de datos para mantener el proyecto independiente de la instancia
  que se encuentra en funcionamiento y realizó ajustes de normalización.
- Revisó y reorganizó elementos del esquema: recuperó el uso de la tabla
  `departamentos` y retiró una tabla que había quedado sin utilidad.
- Preparó estados y prioridades iniciales para facilitar las pruebas.
- Actualizó la documentación técnica e incorporó la deuda técnica y los cambios
  previstos para próximas etapas.
- Trabajó en el fortalecimiento de la seguridad del token JWT y en la revisión
  de aspectos pendientes de ESLint y vulnerabilidades.

### Catálogos, permisos y gestión de tareas - Elizabeth Guevara

- Añadió el campo `color_hex` al catálogo de prioridades para permitir identificar
  visualmente cada prioridad.
- Configuró Row Level Security (RLS) para los catálogos de estados y prioridades:
  los usuarios autenticados pueden consultarlos y únicamente el administrador
  puede modificarlos.
- Implementó la gestión personalizada de estados y prioridades desde el módulo
  de administración.
- Integró los nuevos valores en sus módulos correspondientes y en el formulario
  de asignación de tareas.
- Trabajó en la optimización del espacio disponible en pantalla y en pruebas de
  los ajustes realizados.

### Experiencia móvil y usabilidad - Angel Vega

- Incorporó y ajustó el menú de navegación para mejorar su comportamiento en
  dispositivos móviles.
- Modificó el menú para que su apertura y desplazamiento no muevan el contenido
  principal de la página.
- Añadió la opción para mostrar u ocultar la contraseña en el inicio de sesión.
- Mejoró los textos de la interfaz relacionados con el inicio de sesión,
  sustituyendo etiquetas como «usuario» y «contraseña» por wording más claro.
- Revisó otros componentes de la interfaz para identificar oportunidades de
  mejora en pantallas pequeñas.

### Organización y documentación del proyecto - Claudia Pocasangre

- Reorganizó el README para que funcione como presentación general de OmniFlow,
  en lugar de duplicar instrucciones técnicas de instalación y despliegue.
- Actualizó el índice maestro de documentación (`docs/INDEX.md`) para facilitar
  la navegación por los documentos del proyecto.
- Actualizó y organizó la documentación de instalación y despliegue
  (`docs/06_INSTALACION_DEPLOYMENT.md`).
- Centralizó el detalle técnico en la carpeta `docs/`, manteniendo el README
  como punto de entrada para conocer el propósito, las funcionalidades, la
  arquitectura y la organización del proyecto.

### Desarrollo adicional - Adrian Hernandez

- Apoyo en la integración de componentes y pruebas de usabilidad del sistema.
- Revisión general de código y alineación con las guías del repositorio.

## Documentación

Consulta el [índice general de documentación](./docs/INDEX.md) para navegar por
guías de uso, arquitectura, instalación, validación, riesgos, Supabase y
material de asistencia de IA. Los documentos técnicos conservan el detalle de
implementación para evitar duplicarlo aquí.

## Inicio local

Se requiere Node.js, npm, acceso al proyecto Supabase correspondiente y sus
variables de entorno. Consulta la [guía de instalación y despliegue](./docs/06_INSTALACION_DEPLOYMENT.md)
para los requisitos y la configuración antes de iniciar:

```bash
npm install
npm run dev
```

La aplicación se sirve por defecto en `http://localhost:3000`.
