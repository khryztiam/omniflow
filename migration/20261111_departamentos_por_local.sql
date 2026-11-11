BEGIN;

CREATE TABLE public.locales_departamentos (
    local_id uuid NOT NULL,
    departamento_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT locales_departamentos_pkey PRIMARY KEY (local_id, departamento_id),
    CONSTRAINT locales_departamentos_local_id_fkey
      FOREIGN KEY (local_id) REFERENCES public.locales(id) ON DELETE CASCADE,
    CONSTRAINT locales_departamentos_departamento_id_fkey
      FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id) ON DELETE CASCADE
);

WITH canonical AS (
    SELECT
      id,
      first_value(id) OVER (
        PARTITION BY lower(btrim(nombre))
        ORDER BY id
      ) AS canonical_id
    FROM public.departamentos
)
INSERT INTO public.locales_departamentos (local_id, departamento_id)
SELECT DISTINCT l.id, c.canonical_id
FROM public.locales l
JOIN public.departamentos d ON d.pais_id = l.pais_id
JOIN canonical c ON c.id = d.id
WHERE d.pais_id IS NOT NULL
ON CONFLICT DO NOTHING;

WITH canonical AS (
    SELECT
      id,
      first_value(id) OVER (
        PARTITION BY lower(btrim(nombre))
        ORDER BY id
      ) AS canonical_id
    FROM public.departamentos
)
DELETE FROM public.departamentos d
USING canonical c
WHERE d.id = c.id
  AND d.id <> c.canonical_id;

ALTER TABLE public.departamentos
  DROP CONSTRAINT IF EXISTS departamentos_pais_id_fkey;
DROP INDEX IF EXISTS public.idx_departamentos_pais_id;
ALTER TABLE public.departamentos DROP COLUMN IF EXISTS pais_id;
ALTER TABLE public.departamentos
  ADD CONSTRAINT departamentos_nombre_no_vacio
  CHECK (length(btrim(nombre)) > 0);
CREATE UNIQUE INDEX departamentos_nombre_normalizado_key
  ON public.departamentos (lower(btrim(nombre)));

ALTER TABLE public.usuarios
  ADD COLUMN departamento_id uuid;
ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_departamento_requiere_local
  CHECK (departamento_id IS NULL OR local_id IS NOT NULL);
ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_local_departamento_fkey
  FOREIGN KEY (local_id, departamento_id)
  REFERENCES public.locales_departamentos(local_id, departamento_id);

CREATE INDEX idx_usuarios_departamento_id
  ON public.usuarios (departamento_id);
CREATE INDEX idx_locales_departamentos_departamento_id
  ON public.locales_departamentos (departamento_id);

ALTER TABLE public.locales_departamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY locales_departamentos_admin_full
  ON public.locales_departamentos AS PERMISSIVE FOR ALL TO PUBLIC
  USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY locales_departamentos_select_all
  ON public.locales_departamentos AS PERMISSIVE FOR SELECT TO PUBLIC
  USING (true);

GRANT ALL PRIVILEGES ON TABLE public.locales_departamentos
  TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.guardar_departamento(
  p_departamento_id uuid,
  p_nombre text,
  p_local_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
  v_departamento_id uuid;
  v_nombre text := btrim(p_nombre);
  v_local_ids uuid[] := COALESCE(p_local_ids, ARRAY[]::uuid[]);
BEGIN
  IF v_nombre IS NULL OR v_nombre = '' THEN
    RAISE EXCEPTION 'El nombre del departamento es obligatorio.';
  END IF;

  IF p_departamento_id IS NULL THEN
    INSERT INTO public.departamentos (nombre)
    VALUES (v_nombre)
    RETURNING id INTO v_departamento_id;
  ELSE
    UPDATE public.departamentos
    SET nombre = v_nombre,
        updated_at = timezone('utc', now())
    WHERE id = p_departamento_id
    RETURNING id INTO v_departamento_id;

    IF v_departamento_id IS NULL THEN
      RAISE EXCEPTION 'No existe el departamento indicado.';
    END IF;
  END IF;

  INSERT INTO public.locales_departamentos (local_id, departamento_id)
  SELECT DISTINCT local_id, v_departamento_id
  FROM unnest(v_local_ids) AS selected_local(local_id)
  ON CONFLICT (local_id, departamento_id) DO NOTHING;

  DELETE FROM public.locales_departamentos ld
  WHERE ld.departamento_id = v_departamento_id
    AND NOT (ld.local_id = ANY(v_local_ids));

  RETURN v_departamento_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.guardar_departamento(uuid, text, uuid[])
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guardar_departamento(uuid, text, uuid[])
  TO service_role;

COMMIT;
