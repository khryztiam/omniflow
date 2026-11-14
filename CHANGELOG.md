# Changelog de OmniFlow

Registro de cambios desde el reinicio del proyecto en la version `1.0.0`.
El historial previo se conserva en [CHANGELOG_HISTORICO.md](./CHANGELOG_HISTORICO.md).
Anota cada cambio nuevo en `Unreleased`; al publicar una version, mueve esas
entradas a una seccion con version y fecha y deja `Unreleased` listo para el
siguiente ciclo.

## [Unreleased]

## [1.1.0] - 2026-11-14

### Agregado

- Gestion de estados y prioridades desde `/admin/gestion`, con valores
  personalizados, selector de color y proteccion de los registros base del
  sistema.
- Las etiquetas de estado y prioridad muestran el color configurado en la base
  de datos en dashboards, listados y detalles de tareas.
- Se aprovisiono el esquema inicial de OmniFlow en el proyecto Supabase
  `Tarea Final Kodigo` (`cqqcyqfmjphvdusgxbaq`): 11 tablas, una vista,
  38 politicas RLS, indices, funciones, triggers, Storage y Realtime.
- Se crearon los roles `admin`, `supervisor` y `user`, y cinco cuentas
  iniciales con perfiles en `public.usuarios`.

### Cambiado

- Las prioridades nuevas se agregan al final del orden existente y los nombres
  de catalogo se normalizan a minusculas con guiones bajos.
- Se confirmo que `.env.local` ya apunta al proyecto Supabase nuevo
  `cqqcyqfmjphvdusgxbaq`; el proyecto `ITFlow Team` no se modifico.
- Se unifico el isotipo y el wordmark OmniFlow en el login, el sidebar de todos
  los roles y los componentes de encabezado de marca reutilizables.

### Corregido

- La redireccion del rol `user` desde `/` ahora apunta a `/user/dashboard`.

### Seguridad

- Las contrasenas iniciales no se almacenan en el repositorio. Consultar
  `docs/USUARIOS_INICIALES.md` y compartirlas por un canal seguro.
- La revision de Supabase detecto avisos de seguridad pendientes sobre la vista
  `vw_alertas_usuario_estado`, funciones `SECURITY DEFINER` ejecutables por
  `anon`/`authenticated`, `search_path` mutable en algunas funciones y
  proteccion contra contrasenas filtradas deshabilitada. No se modificaron
  estos comportamientos en esta inicializacion; ver `migration/README.md`.
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

### Reinicio de linea base

- OmniFlow inicia una nueva linea de versionado independiente del historial archivado.
- La version de la aplicacion queda establecida en `1.0.0`.
- Se establece la marca OmniFlow y el dominio configurable de correo `@omniflow.com`.
- El esquema nuevo usa nombres neutrales para las funciones de validacion de roles.
- Los scripts de inicializacion y prueba usan configuracion de entorno en lugar de cuentas y credenciales del proyecto anterior.
