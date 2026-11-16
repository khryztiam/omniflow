# OmniFlow - Resumen tecnico de entrega

**Corte documental:** 15 de noviembre de 2026
**Versión declarada en `package.json`:** `1.2.0`
**Estado:** candidata local no publicada; promoción a producción pendiente.

---

## Resumen

OmniFlow es una aplicacion web privada para organizar, asignar y dar seguimiento
a tareas de equipos de trabajo. La aplicacion contempla tres roles activos:
**admin**, **supervisor** y **user**.

La app usa **Next.js con Pages Router**, **JavaScript**, **Supabase**, **CSS Modules**, **React Icons** y **Lucide React**.

---

## Estado por rol

| Rol        | Estado    | Alcance real                                                                                             |
| ---------- | --------- | -------------------------------------------------------------------------------------------------------- |
| Admin      | Activo ✅ | Vista global, estadisticas, gestion de catalogos, usuarios, tareas, asignaciones y alertas               |
| Supervisor | Activo ✅ | Vista local, tareas propias, tareas de usuarios supervisados, gestion de usuarios y asignaciones locales |
| User       | Activo ✅ | Tareas asignadas, avance, comentarios, evidencias y confirmacion de alertas                              |

---

## Vistas principales

### Admin

- `/admin/dashboard`: tablero global por region, carga por responsable, estado global, riesgo actual y alertas.
- `/admin/estadisticas`: analisis del portafolio de tareas, graficos y lectura por fechas.
- `/admin/gestion`: paises, locales, departamentos, usuarios y catalogos
  configurables de estados y prioridades.
- `/admin/tareas`: gestion global de tareas, filtros, evidencias y comentarios.
- `/admin/asignaciones`: asignacion centralizada.

### Supervisor

- `/supervisor/dashboard`: tablero local con tareas propias y tareas de usuarios supervisados.
- `/supervisor/gestion`: asignacion y desasignacion de usuarios supervisados.
- `/supervisor/tareas`: tareas del supervisor, filtros y reasignacion.
- `/supervisor/asignaciones`: gestion local y creacion de tareas.
- `/supervisor/tarea/[id]`: detalle de tarea.

### User

- `/user/dashboard`: resumen personal, filtros, alerta activa y drawer de detalle.
- `/user/tareas`: listado de tareas asignadas con drawer de detalle.
- `/user/tarea/[id]`: vista completa de respaldo para detalle, avance, comentarios y evidencias.

---

## Flujos activos

- Login con Supabase Auth.
- Carga de perfil desde `usuarios`, incluyendo rol y local.
- Redireccion por rol desde `/`.
- Proteccion de rutas con `useAdmin`, `useSupervisor` y `useUser`.
- APIs internas para tareas, usuarios, locales, paises, estados, prioridades,
  evidencias y comentarios.
- Realtime en cambios de `tareas` para admin, user y supervisor.
- Alertas admin -> user mediante `alertas_usuario`.
- Subida de evidencias al bucket `evidencias-tareas`.

---

## Modelo funcional usado por el codigo

Tablas y vistas relevantes:

- `usuarios`
- `roles`
- `locales`
- `paises`
- `tareas`
- `estados_tarea`
- `prioridades`
- `comentarios_tarea`
- `evidencias_tareas`
- `alertas_usuario`
- `vw_alertas_usuario_estado`

Funciones/RPC relevantes:

- `confirmar_alerta_usuario`

Los catálogos `estados_tarea` y `prioridades` se pueden ampliar desde
`/admin/gestion`. Los valores base con semántica interna mantienen sus nombres;
`completado` conserva la lógica de cierre. Los valores personalizados son
opcionales y sus colores se muestran en etiquetas de tareas.

---

## Tecnologias

| Paquete                 | Version    |
| ----------------------- | ---------- |
| `next`                  | `^16.1.0`  |
| `react`                 | `^18.3.0`  |
| `react-dom`             | `^18.3.0`  |
| `@supabase/supabase-js` | `^2.45.0`  |
| `react-icons`           | `^5.0.0`   |
| `lucide-react`          | `^0.395.0` |
| `recharts`              | `^2.12.0`  |
| `chart.js`              | `^4.4.1`   |
| `react-chartjs-2`       | `^5.2.0`   |
| `date-fns`              | `^3.6.0`   |
| `vitest`                | `^1.1.0`   |

---

## Seguridad y permisos

- El cliente usa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- El backend y scripts usan `SUPABASE_SERVICE_ROLE_KEY`.
- Las API routes validan el JWT mediante `supabaseAdmin.auth.getUser(token)` y
  buscan el perfil por el UUID autenticado; RLS sigue siendo una capa adicional.
- El rol y el alcance se vuelven a comprobar en servidor antes de las
  operaciones protegidas.
- Para datos sensibles, mantener validacion en servidor y RLS estricto.

---

## Deuda tecnica residual y alcance de validacion

- La suite automatizada existente cubre autenticacion: en la revision de esta
  base, `npm test -- --run` ejecutó 6 pruebas en un archivo y todas pasaron.
  No hay evidencia equivalente de cobertura integral de los flujos funcionales.
- El frontend combina consultas directas a Supabase con API routes. Es un
  patron existente que conviene mantener bajo revision para que las reglas de
  acceso y negocio sean consistentes; no se registra como falla funcional
  confirmada.
- La validacion de operaciones de escritura y los flujos reales por rol debe
  completarse en un entorno de prueba antes de autorizar una entrega.
- `npm audit` reportó 29 entradas de paquetes afectados en el árbol completo,
  incluidas 4 críticas; `npm audit --omit=dev` reportó 7 en producción,
  incluida una crítica en `next`. No se actualizaron dependencias; los detalles
  están en [la auditoría de dependencias](13_VULNERABILIDADES_ACTUALES.md).
  La promoción a producción debe esperar la corrección y revalidación de estos
  hallazgos.
- Validación local del 15 de noviembre de 2026: `npm test -- --run` pasó las 6
  pruebas y `npm run build` completó. `npm run lint` falló con 24 errores y 14
  advertencias en 13 archivos de `src`; no se modificó código de aplicación en
  esta etapa.
- La promoción también debe esperar que lint pase. Los resultados detallados
  de seguridad y dependencias se mantienen en sus documentos especializados.

Esta seccion describe brechas de validacion y mantenibilidad, no fallos
confirmados de la aplicacion. No implica aprobacion de despliegue a produccion.

## Criterios de entrega

1. Ejecutar `npm run lint`, `npm test -- --run` y `npm run build`.
2. Revisar dependencias en `docs/13_VULNERABILIDADES_ACTUALES.md`.
3. Confirmar esquema, permisos y configuracion del entorno en
   `migration/README.md` y `SUPABASE_ESQUEMA_Y_FLUJOS.md`.
4. Probar login, permisos y tareas con los tres roles, incluyendo escrituras
   controladas, comentarios, evidencias, alertas y Realtime.
5. Registrar commit, entorno y resultados antes de promover una version.
