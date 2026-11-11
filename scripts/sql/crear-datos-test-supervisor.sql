-- Ejecutar despues de crear los usuarios de prueba y catalogos en Supabase.
-- Los correos se identifican por su nombre local, independientemente del dominio.

BEGIN;

CREATE TEMP TABLE datos_prueba_supervisor ON COMMIT DROP AS
SELECT
  supervisor.id AS supervisor_id,
  usuario.id AS usuario_id,
  supervisor.local_id
FROM public.usuarios supervisor
JOIN public.roles rol_supervisor
  ON rol_supervisor.id = supervisor.rol_id
 AND rol_supervisor.nombre = 'supervisor'
JOIN public.usuarios usuario
  ON usuario.supervisor_id = supervisor.id
JOIN public.roles rol_usuario
  ON rol_usuario.id = usuario.rol_id
 AND rol_usuario.nombre = 'user'
WHERE split_part(supervisor.email, '@', 1) = 'supervisor'
  AND split_part(usuario.email, '@', 1) = 'usuario1'
LIMIT 1;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM datos_prueba_supervisor WHERE local_id IS NOT NULL) THEN
    RAISE EXCEPTION 'No se encontró supervisor/usuario1 de prueba con local asignado. Ejecuta primero scripts/crearUsuariosPrueba.js y asigna un local.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.estados_tarea WHERE nombre = 'pendiente')
    OR NOT EXISTS (SELECT 1 FROM public.estados_tarea WHERE nombre = 'en progreso')
    OR NOT EXISTS (SELECT 1 FROM public.estados_tarea WHERE nombre = 'completado')
    OR NOT EXISTS (SELECT 1 FROM public.prioridades WHERE nombre = 'Alta')
    OR NOT EXISTS (SELECT 1 FROM public.prioridades WHERE nombre = 'Media')
    OR NOT EXISTS (SELECT 1 FROM public.prioridades WHERE nombre = 'Baja') THEN
    RAISE EXCEPTION 'Faltan estados o prioridades requeridos por los datos de prueba.';
  END IF;
END;
$$;

INSERT INTO public.tareas (
  titulo, descripcion, local_id, creado_por, estado_id, prioridad_id,
  fecha_inicio, fecha_limite, porcentaje_avance, created_at, updated_at
)
SELECT
  '[PRUEBA] Revisar reportes mensuales',
  'Tarea de prueba creada por el supervisor para verificar su vista.',
  contexto.local_id,
  contexto.supervisor_id,
  (SELECT id FROM public.estados_tarea WHERE nombre = 'pendiente' LIMIT 1),
  (SELECT id FROM public.prioridades WHERE nombre = 'Alta' LIMIT 1),
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  0,
  NOW(),
  NOW()
FROM datos_prueba_supervisor contexto
WHERE NOT EXISTS (
  SELECT 1 FROM public.tareas
  WHERE titulo = '[PRUEBA] Revisar reportes mensuales'
);

INSERT INTO public.tareas (
  titulo, descripcion, local_id, creado_por, asignado_a, estado_id,
  prioridad_id, fecha_inicio, fecha_limite, porcentaje_avance, created_at, updated_at
)
SELECT
  '[PRUEBA] Verificar inventario',
  'Tarea asignada al usuario1 de prueba para validar la vista del supervisor.',
  contexto.local_id,
  contexto.supervisor_id,
  contexto.usuario_id,
  (SELECT id FROM public.estados_tarea WHERE nombre = 'en progreso' LIMIT 1),
  (SELECT id FROM public.prioridades WHERE nombre = 'Media' LIMIT 1),
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '3 days',
  25,
  NOW(),
  NOW()
FROM datos_prueba_supervisor contexto
WHERE NOT EXISTS (
  SELECT 1 FROM public.tareas
  WHERE titulo = '[PRUEBA] Verificar inventario'
);

INSERT INTO public.tareas (
  titulo, descripcion, local_id, creado_por, asignado_a, estado_id,
  prioridad_id, fecha_inicio, fecha_limite, porcentaje_avance, created_at, updated_at
)
SELECT
  '[PRUEBA] Completar documentación',
  'Tarea completada asignada al usuario1 para probar distintos estados.',
  contexto.local_id,
  contexto.supervisor_id,
  contexto.usuario_id,
  (SELECT id FROM public.estados_tarea WHERE nombre = 'completado' LIMIT 1),
  (SELECT id FROM public.prioridades WHERE nombre = 'Baja' LIMIT 1),
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE - INTERVAL '2 days',
  100,
  NOW(),
  NOW()
FROM datos_prueba_supervisor contexto
WHERE NOT EXISTS (
  SELECT 1 FROM public.tareas
  WHERE titulo = '[PRUEBA] Completar documentación'
);

COMMIT;
