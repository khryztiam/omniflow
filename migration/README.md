# Migracion del esquema base de OmniFlow a Supabase

## Snapshot extraido

`schema.sql` contiene una base DDL para provisionar un nuevo proyecto Supabase.
No incluye filas de negocio, usuarios de Auth ni archivos de Storage.

Inventario del esquema preparado para recreacion:

- 12 tablas del esquema `public`, con columnas, defaults, constraints y claves
  foraneas. La tabla `usuarios` referencia `auth.users`, que debe existir en el
  proyecto Supabase destino. Se excluyo `countries`, una tabla huerfana fuera
  del alcance de la aplicacion.
- RLS habilitado en 12 tablas y 40 politicas.
- 26 indices, 15 funciones, 4 triggers y 1 vista.
- Membresia de `public.tareas` y `public.alertas_usuario` en
  `supabase_realtime`.
- Los grants del origen incluyen privilegios de tabla amplios para `anon`,
  `authenticated` y `service_role` (excepto `anon` en `alertas_usuario`), y
  `EXECUTE` para esas funciones. La vista no tiene opciones que fuercen
  `security_invoker`; el snapshot conserva ese comportamiento.
- No hay Edge Functions desplegadas en el proyecto origen.
- Bucket `evidencias-tareas`: publico, limite de 10 MiB, sin restriccion de
  tipos MIME. No se encontraron politicas en el esquema `storage`.
- Extensiones de aplicacion: `pgcrypto` y `uuid-ossp`.

El proyecto tambien tiene extensiones administradas por Supabase
(`pg_stat_statements`, `supabase_vault` y `plpgsql`); no se recrean como parte
del DDL de la aplicacion.

`export-schema.ps1` permite volver a extraer un dump con Supabase CLI.
Su salida predeterminada es `schema-export.sql` para no sobrescribir el
snapshot completo; el dump CLI por si solo no incluye la configuracion de
bucket y la membresia Realtime documentadas arriba.
`apply-schema.ps1` aplica `schema.sql` al proyecto destino con `psql`, en una
transaccion y deteniendose ante el primer error.

## Renombrado de plantas a locales

El esquema base vigente (`schema.sql`) usa `locales`, `usuarios.local_id`,
`tareas.local_id` y la funcion `obtener_local_usuario()`.

Para una base ya creada, no vuelvas a aplicar `schema.sql`: usa las migraciones
incrementales en orden:

1. `20261111_rename_plantas_to_locales.sql` renombra la tabla, columnas,
   restricciones e indices, y actualiza las funciones y politicas RLS.
2. `20261111_local_policy_alias_cleanup.sql` limpia alias heredados en dos
   politicas RLS sin cambiar sus condiciones de acceso.

Ambas migraciones se aplicaron el 11 de noviembre de 2026. Usan
`ALTER ... RENAME` para conservar los registros y las relaciones existentes.

## Departamentos asociados a locales

`20261111_departamentos_por_local.sql` actualiza una base ya provisionada para
usar un catalogo compartido de departamentos. Crea `locales_departamentos`,
agrega `usuarios.departamento_id` con una clave foranea compuesta que valida
la combinacion de local y departamento, y elimina `departamentos.pais_id`
porque el pais se deriva del local.

La migracion conserva las asociaciones departamento-pais existentes
convirtiendolas en asociaciones con los locales de ese pais y consolida
departamentos duplicados por nombre normalizado. Debe aplicarse una sola vez
en bases que ya tengan el esquema anterior; `schema.sql` ya representa el
esquema final para una instalacion nueva.

`20261111_departamentos_fk_directa.sql` agrega, ademas, una FK directa desde
`usuarios.departamento_id` hasta `departamentos.id`. La FK compuesta anterior
se conserva para validar que el departamento este habilitado para el local.
La relacion directa permite a PostgREST resolver el departamento en las
consultas de perfiles; esas consultas identifican explicitamente esta FK.

`20261112_seed_catalogos_tareas.sql` agrega de forma idempotente los valores
base de estados y prioridades que necesita la logica actual de la aplicacion.
Son valores iniciales reservados, no una lista cerrada: el administrador puede
agregar opciones propias desde `/admin/gestion` sin una migracion de esquema.
Antes de crear tareas, verifica que los valores base existan; la disponibilidad
del archivo no implica que se haya aplicado en cada entorno. Puede ejecutarse
en una instalacion nueva o en una base existente desde el SQL Editor de Supabase
o con `psql`.

Las dos migraciones de departamentos se aplicaron el 11 de noviembre de 2026.
La validacion posterior confirmo 12 tablas publicas y 40 politicas RLS.
El catalogo de departamentos, las asociaciones con locales y las asignaciones
departamentales de usuarios quedaron vacios; los cinco perfiles existentes no
fueron modificados.

## Requisitos

- Supabase CLI disponible como `supabase`.
- PowerShell.
- Acceso de lectura a la base PostgreSQL origen.
- La variable de entorno `SUPABASE_DB_URL` definida temporalmente en la sesion
  de PowerShell con la cadena de conexion del origen. No la guardes en este
  repositorio.
- Para aplicar el dump: `psql` disponible y `SUPABASE_TARGET_DB_URL` definida
  temporalmente con la cadena de conexion del destino.
- El proyecto destino debe ser un proyecto Supabase nuevo o tener libre el
  esquema `public` y el bucket del mismo nombre; el dump no es idempotente para
  tablas, funciones, politicas e indices que ya existan.

## Exportar el esquema

Desde la raiz del proyecto, define `SUPABASE_DB_URL` de forma segura en tu
sesion y ejecuta:

```powershell
.\migration\export-schema.ps1
```

Por defecto se exportan los esquemas `public` y `extensions` a
`migration\schema-export.sql`. Para incluir otros esquemas de aplicacion:

```powershell
.\migration\export-schema.ps1 -Schema public,extensions,mi_esquema
```

El archivo existente no se sobrescribe a menos que se indique `-Force`.
Revisa el dump antes de aplicarlo en el proyecto destino. Debe ejecutarse con
un rol que pueda leer la definicion de todos los objetos que se quieran migrar.

## Aplicar en el proyecto destino

1. Crea el nuevo proyecto Supabase. Auth debe estar habilitado, ya que el DDL
   referencia `auth.users`.
2. Revisa `schema.sql`, en especial los permisos y las politicas RLS. El
   snapshot conserva los permisos observados en origen; no los endurece.
3. Define `SUPABASE_TARGET_DB_URL` en la sesion de PowerShell con la conexion
   destino; no la guardes en el repositorio.
4. Ejecuta `.\migration\apply-schema.ps1`. El script solicita confirmacion,
   usa una transaccion y se detiene ante el primer error.
5. Configura los valores requeridos en el hosting y en el `.env.local` local
   tomando como referencia `variables.env.example`.
6. Crea los datos base que el esquema no incluye: roles, paises, locales,
   estados y prioridades. Los scripts de usuarios de prueba necesitan al
   menos esos catalogos y un local disponible.
7. Configura `NEXT_PUBLIC_APP_DOMAIN` con el dominio de correo elegido en el
   entorno local y de despliegue. Crea primero la cuenta administrativa y,
   solo si se requieren pruebas, los usuarios de prueba.

El sembrado de datos de prueba usa `admin-prueba`, `supervisor`, `usuario1`
y `usuario2` como nombres de usuario locales. `usuario1` y `usuario2` quedan
asociados al supervisor de prueba. `crearAdminInicial.js` crea la cuenta
administrativa independiente; las contrasenas se proporcionan por variables
de entorno y no se imprimen.

## Configuracion del proyecto que debe trasladarse aparte

Un dump PostgreSQL de esquemas de aplicacion no incluye toda la configuracion
administrada por Supabase. Las herramientas MCP disponibles no exponen estas
opciones para exportacion automatica; verificalas en el Dashboard de origen y
configuralas en el proyecto destino:

- Auth: proveedores, URLs de redireccion, politicas de contrasena, SMTP y
  plantillas de correo.
- Edge Functions, integraciones y secretos del hosting. No se extraen ni
  almacenan valores secretos.
- Configuracion del proyecto que no forma parte del DDL (por ejemplo, settings
  de API, Auth y politicas de red).
- Storage: el bucket y sus propiedades se recrean desde `schema.sql`, pero no
  se copian archivos. La consulta de origen no encontro politicas del esquema
  `storage`.
- Realtime: se recrea la membresia de las dos tablas identificadas; valida
  tambien cualquier setting adicional del proyecto.
- Variables y secretos de Supabase Functions/hosting: crea valores nuevos en
  el destino. Los nombres de variables que usa la aplicacion estan en
  `variables.env.example`; ese archivo no contiene valores reales.

No se migran usuarios de Supabase Auth, sesiones, datos de negocio, objetos de
Storage ni secretos. La tabla `roles` de la aplicacion tambien es dato; sus
filas no se copian al hacer un dump solo de esquema.

## Fuentes de esquema ya presentes en el repositorio

Los siguientes SQL son cambios puntuales versionados, no un snapshot completo
ni una confirmacion de que la base actual coincida con ellos:

- `scripts/sql/2026-04-21_alertas_usuario_flujo.sql`
- `scripts/sql/2026-04-22_enable_realtime_alertas_usuario.sql`

La documentacion existente tambien describe objetos como `usuarios`,
`tareas`, `comentarios_tarea`, `evidencias_tareas`, `alertas_usuario` y la vista
`vw_alertas_usuario_estado`, pero no sustituye al dump real.

El historial remoto registra 17 migraciones. MCP proporciono sus versiones y
nombres, pero no los cuerpos SQL; por eso no se recrean ni se reproducen como
migraciones versionadas. El snapshot actual de `schema.sql` es el artefacto
para una instalacion limpia sin datos.

## Aprovisionamiento inicial del entorno

El 11 de noviembre de 2026 se aprovisiono el esquema de la aplicacion en el
entorno Supabase configurado para el equipo. Las credenciales y los
identificadores del entorno se administran fuera de este documento.

Se verifico que el destino estaba vacio antes de aplicar el esquema. En el
aprovisionamiento inicial, la estructura instalada tenia:

- 11 tablas de aplicacion en `public` y la vista
  `public.vw_alertas_usuario_estado`.
- RLS habilitado en las 11 tablas y 38 politicas.
- Los indices definidos por el snapshot, incluyendo los asociados a claves
  primarias y restricciones unicas.
- 14 funciones de aplicacion y 4 triggers. Supabase tambien muestra una
  funcion `rls_auto_enable` en el esquema `public`; no forma parte del snapshot
  de OmniFlow.
- Las tablas `public.tareas` y `public.alertas_usuario` en
  `supabase_realtime`.
- Bucket `evidencias-tareas`, publico, con limite de 10 MiB. No se cargaron
  objetos de Storage.

El despliegue quedo registrado en el historial de migraciones de Supabase con
los nombres `omniflow_schema_tables`, `omniflow_schema_functions`,
`omniflow_schema_security_storage` y `omniflow_initial_roles`.

### Datos iniciales

Se insertaron solo los roles `admin`, `supervisor` y `user`, y cinco cuentas
confirmadas en Supabase Auth con sus perfiles en `public.usuarios`. Los tres
usuarios operativos estan asignados al supervisor. Las cinco cuentas empiezan
activas y sin local asignado. La lista se mantiene en
[`docs/USUARIOS_INICIALES.md`](../docs/USUARIOS_INICIALES.md); las contrasenas
no se guardan en el repositorio.

En el aprovisionamiento inicial no se cargaron paises, locales, departamentos,
estados de tarea, prioridades, tareas, comentarios, evidencias ni alertas. La
migracion `20261112_seed_catalogos_tareas.sql` ofrece los valores base
requeridos para estados y prioridades; verifica si se aplico en el entorno
objetivo. El administrador puede agregar valores personalizados en
`/admin/gestion`. Antes de crear tareas tambien deben existir paises y locales,
y asignarse un local a supervisor y usuarios segun corresponda.

### Validacion y pendientes de seguridad

La validacion del aprovisionamiento inicial comprobo 11 tablas, una vista, 38
politicas, las dos tablas Realtime y el bucket esperado. Los conteos de Auth y
perfiles son cinco; los catalogos de paises y locales, tareas, comentarios,
evidencias, alertas y objetos de Storage estan vacios. Se validaron tambien el
inicio de sesion de las cinco cuentas, sus roles y la relacion de supervisor.

La revision de Security Advisors de Supabase reporto los siguientes puntos
pendientes, heredados del comportamiento del snapshot y no corregidos como
parte del aprovisionamiento:

- `vw_alertas_usuario_estado` se detecta como vista `SECURITY DEFINER`. Revisar
  si corresponde habilitar `security_invoker` para respetar los permisos y RLS
  del usuario que consulta. [Guia de Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view).
- Funciones `SECURITY DEFINER` ejecutables por `anon` y `authenticated`.
  Confirmar el acceso requerido por cada RPC y revocar permisos innecesarios.
  [Guia para `anon`](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
  y [para `authenticated`](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- Cuatro funciones con `search_path` mutable. Fijarlo explicitamente despues
  de revisar dependencias y referencias de esquema.
  [Guia de Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable).
- La proteccion de Supabase Auth contra contrasenas filtradas esta desactivada.
  Activarla desde la configuracion de Auth.
  [Guia de seguridad de contrasenas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Tambien hay que revisar en el Dashboard la configuracion administrada de Auth,
redirect URLs, proveedores, SMTP, plantillas de correo y secretos del hosting.
Cada entorno debe configurar estos valores de forma independiente; no se
almacenan credenciales ni secretos en este repositorio.
