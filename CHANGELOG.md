# Changelog de OmniFlow

Registro consolidado de la evolución funcional de OmniFlow. Las fechas de
versión corresponden a publicaciones; los hitos de la base funcional se agrupan
por semanas del periodo de integración, sin asignar fechas individuales a
commits. Anota los cambios nuevos en `Unreleased` y, al publicar una versión,
muévelos a una sección con versión y fecha.

Las entradas actuales de `Unreleased` corresponden a la candidata local
`1.2.0`; aún no está publicada ni autorizada para promoción a producción.

## [Unreleased]

### Agregado

- Menu movil compartido para admin, supervisor y user en pantallas de hasta
  768 px. Conserva los enlaces de cada rol, la informacion del usuario y el
  cierre de sesion en un panel superpuesto con desplazamiento propio.
- Boton para mostrar y ocultar la contrasena en el login, disponible en movil
  y escritorio, con etiqueta accesible y area tactil de 44 px.

### Corregido

- La navegacion y el cierre de sesion vuelven a estar disponibles en movil.
  El menu se cierra con su boton, Escape, una pulsacion fuera del panel, al
  salir con el teclado o al navegar, sin desplazar el contenido de la pagina.
- Los filtros de `/supervisor/asignaciones` se reorganizan en dos columnas
  hasta 1200 px y una hasta 768 px; los controles respetan el ancho disponible.
- Las tarjetas de resumen de `/supervisor/gestion` se apilan hasta 640 px y
  los nombres largos de usuarios, locales y departamentos pueden ajustarse.
- Los encabezados de `/admin/tareas`, `/supervisor/tareas` y
  `/supervisor/asignaciones` usan alturas naturales en movil, evitando los
  espacios grandes causados por las bases flex del diseno de escritorio.
- Las tablas genericas limitan el desplazamiento horizontal a su propio
  contenedor para mantener accesibles las columnas anchas.
- Los campos del login muestran `Usuario` y `Contraseña`.

### Documentacion

- Se agregaron instrucciones de uso movil al README y una matriz de
  comprobaciones responsive y de login a la guia de validacion rapida.

## [1.1.0] - 2026-11-14

### Agregado

- Gestion de estados y prioridades desde `/admin/gestion`, con valores
  personalizados, selector de color y proteccion de los registros base del
  sistema.
- Las etiquetas de estado y prioridad muestran el color configurado en la base
  de datos en dashboards, listados y detalles de tareas.
- Se aprovisionó el esquema de la aplicación en Supabase, con políticas RLS,
  índices, funciones, triggers, Storage y Realtime. El estado operativo se
  documenta en `migration/README.md`.
- Se crearon los roles `admin`, `supervisor` y `user`, y cinco cuentas
  iniciales con perfiles en `public.usuarios`.

### Cambiado

- Las prioridades nuevas se agregan al final del orden existente y los nombres
  de catalogo se normalizan a minusculas con guiones bajos.
- Se unifico el isotipo y el wordmark OmniFlow en el login, el sidebar de todos
  los roles y los componentes de encabezado de marca reutilizables.

### Corregido

- La redireccion del rol `user` desde `/` ahora apunta a `/user/dashboard`.

### Seguridad y configuración

- Las contrasenas iniciales no se almacenan en el repositorio. Consultar
  `docs/USUARIOS_INICIALES.md` y compartirlas por un canal seguro.
- Los controles pendientes de configuración y seguridad del entorno se
  registraron en `migration/README.md`.
- Las API routes ahora validan el token con `supabaseAdmin.auth.getUser(token)`
  y consultan el perfil por el UUID autenticado, en lugar de confiar en el
  payload decodificado del JWT.

### Documentacion

- Se documento el estado del aprovisionamiento y los pasos pendientes en
  `migration/README.md`.
- Se agrego `docs/USUARIOS_INICIALES.md` con los usuarios, roles y relaciones
  iniciales, sin guardar contrasenas.
- Se actualizaron README y guias de administracion, usuario, flujos y Supabase
  para documentar los catalogos configurables, los valores base y la validacion
  server-side del token.

---

## [1.0.0] - 2026-11-11

### Línea base de OmniFlow

- Se estableció la versión `1.0.0` como línea base de la aplicación.
- Se establece la marca OmniFlow y el dominio configurable de correo `@omniflow.com`.
- El esquema nuevo usa nombres neutrales para las funciones de validacion de roles.
- Los scripts de inicialización y prueba usan configuración de entorno para
  evitar credenciales incrustadas.

---

## Base funcional integrada - octubre de 2026

Los hitos funcionales que formaron la base de OmniFlow se agrupan por semanas
del periodo de integración de octubre. La agrupación resume el registro de
desarrollo; no asigna fechas individuales a commits ni representa publicaciones
de producción.

### Semana 1 - Base de aplicación y operación

- Se establecieron autenticación, roles, dashboards, tareas, APIs y componentes
  principales.
- Se incorporaron configuración de entorno, carga de evidencias y actualizaciones
  Realtime para dashboards administrativos y de usuario.

### Semana 2 - Administración e identidad visual

- Se ampliaron el panel administrativo, la gestión de tareas y asignaciones, y
  las estadísticas.
- Se mejoraron la tabla genérica, la navegación, los formularios y los estilos
  administrativos.
- Se incorporaron la identidad visual reutilizable, el favicon y la versión de
  la aplicación desde `package.json`.

### Semana 3 - Alertas y seguimiento

- Se añadió el flujo de alertas de administración a usuario, con confirmación
  de lectura y soporte Realtime.
- Se incorporaron las estructuras, funciones y políticas RLS requeridas para
  gestionar el estado de las alertas.
- Se mejoró el manejo de respuestas inválidas y límites en la carga de
  evidencias.

### Semana 4 - Supervisión y detalle de tareas

- Se incorporaron dashboard, gestión, tareas, asignaciones y consulta de
  tareas para el alcance del supervisor.
- Se añadieron gestión de usuarios supervisados, comentarios, evidencias y
  Realtime, además de herramientas de validación de acceso.
- Se reorganizaron dashboards y estadísticas; las interacciones con tareas
  adoptaron un panel de detalle compartido.
- Se mejoraron el cálculo de vencimientos, la presentación de tarjetas y
  paneles de riesgo, los estados vacíos y el layout de dashboards.
- Se consolidaron guías por rol, estado del proyecto e instrucciones de
  validación, y se retiraron credenciales incrustadas en scripts.
