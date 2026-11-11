# Usuarios iniciales de OmniFlow

Proyecto Supabase: `cqqcyqfmjphvdusgxbaq` (`Tarea Final Kodigo`).

La pantalla de inicio recibe el nombre de usuario y agrega el dominio
`@omniflow.com` configurado en el proyecto. Las cuentas iniciales son:

| Usuario | Correo de Auth | Rol | Relación |
| --- | --- | --- | --- |
| `admin01` | `admin01@omniflow.com` | admin | Administrador |
| `super01` | `super01@omniflow.com` | supervisor | Supervisor |
| `user01` | `user01@omniflow.com` | user | Asignado a `super01` |
| `user02` | `user02@omniflow.com` | user | Asignado a `super01` |
| `user03` | `user03@omniflow.com` | user | Asignado a `super01` |

Las cuentas están confirmadas en Supabase Auth y sus perfiles están en
`public.usuarios`. Todas comienzan activas y sin local asignado. Las
contraseñas iniciales no se guardan en el repositorio; deben compartirse por un
canal seguro y cambiarse después del primer acceso.

Solo se sembraron los tres roles requeridos y los cinco usuarios. Para empezar
a crear tareas, todavía deben agregarse los catálogos de países, locales,
estados de tarea y prioridades.
