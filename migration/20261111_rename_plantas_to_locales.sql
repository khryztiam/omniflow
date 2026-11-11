BEGIN;

ALTER TABLE public.plantas RENAME TO locales;
ALTER TABLE public.locales RENAME CONSTRAINT plantas_pkey TO locales_pkey;
ALTER TABLE public.locales
  RENAME CONSTRAINT plantas_nombre_pais_id_key TO locales_nombre_pais_id_key;
ALTER TABLE public.locales
  RENAME CONSTRAINT plantas_pais_id_fkey TO locales_pais_id_fkey;

ALTER TABLE public.usuarios RENAME COLUMN planta_id TO local_id;
ALTER TABLE public.usuarios
  RENAME CONSTRAINT usuarios_planta_id_fkey TO usuarios_local_id_fkey;
ALTER TABLE public.tareas RENAME COLUMN planta_id TO local_id;
ALTER TABLE public.tareas
  RENAME CONSTRAINT tareas_planta_id_fkey TO tareas_local_id_fkey;

ALTER INDEX public.idx_plantas_pais_id RENAME TO idx_locales_pais_id;
ALTER INDEX public.idx_tareas_planta_id RENAME TO idx_tareas_local_id;
ALTER INDEX public.idx_usuarios_planta_id RENAME TO idx_usuarios_local_id;

ALTER FUNCTION public.obtener_planta_usuario()
  RENAME TO obtener_local_usuario;

CREATE OR REPLACE FUNCTION public.obtener_local_usuario()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT local_id FROM usuarios WHERE id = auth.uid() LIMIT 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.obtener_pais_usuario()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT l.pais_id
    FROM usuarios u
    JOIN locales l ON u.local_id = l.id
    WHERE u.id = auth.uid()
    LIMIT 1
  );
END;
$function$;

ALTER POLICY plantas_admin_full ON public.locales RENAME TO locales_admin_full;
ALTER POLICY plantas_select_all ON public.locales RENAME TO locales_select_all;

COMMIT;
