BEGIN;

INSERT INTO public.estados_tarea (nombre, color_hex)
SELECT catalogo.nombre, catalogo.color_hex
FROM (
  VALUES
    ('pendiente', '#FFC107'),
    ('en_proceso', '#2196F3'),
    ('en_revision', '#FF9800'),
    ('completado', '#4CAF50'),
    ('detenido', '#F44336')
) AS catalogo(nombre, color_hex)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.estados_tarea estado
  WHERE lower(btrim(estado.nombre)) = catalogo.nombre
);

INSERT INTO public.prioridades (nombre, orden, color_hex)
SELECT
  catalogo.nombre,
  (SELECT COALESCE(MAX(prioridad.orden), 0) FROM public.prioridades prioridad)
    + catalogo.orden,
  catalogo.color_hex
FROM (
  VALUES
    ('baja', 1, '#4CAF50'),
    ('media', 2, '#FFC107'),
    ('alta', 3, '#FF9800'),
    ('urgente', 4, '#F44336')
) AS catalogo(nombre, orden, color_hex)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.prioridades prioridad
  WHERE lower(btrim(prioridad.nombre)) = catalogo.nombre
);

COMMIT;
