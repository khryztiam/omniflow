-- OmniFlow Supabase schema baseline for a new project. No source rows or file objects.
BEGIN;
SET LOCAL search_path = public, auth, extensions, storage;

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Empty sequence start; source rows and current sequence values are not copied.
CREATE TABLE public.paises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT paises_nombre_key UNIQUE (nombre),
    CONSTRAINT paises_pkey PRIMARY KEY (id)
);

CREATE TABLE public.locales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    pais_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT locales_nombre_pais_id_key UNIQUE (nombre, pais_id),
    CONSTRAINT locales_pais_id_fkey FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE RESTRICT,
    CONSTRAINT locales_pkey PRIMARY KEY (id)
);

CREATE TABLE public.departamentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT departamentos_nombre_no_vacio CHECK (length(btrim(nombre)) > 0),
    CONSTRAINT departamentos_pkey PRIMARY KEY (id)
);

CREATE TABLE public.locales_departamentos (
    local_id uuid NOT NULL,
    departamento_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT locales_departamentos_pkey PRIMARY KEY (local_id, departamento_id),
    CONSTRAINT locales_departamentos_local_id_fkey FOREIGN KEY (local_id) REFERENCES locales(id) ON DELETE CASCADE,
    CONSTRAINT locales_departamentos_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE
);

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT roles_nombre_key UNIQUE (nombre),
    CONSTRAINT roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.estados_tarea (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    color_hex text DEFAULT '#cccccc'::text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT estados_tarea_nombre_key UNIQUE (nombre),
    CONSTRAINT estados_tarea_pkey PRIMARY KEY (id)
);

CREATE TABLE public.prioridades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre text NOT NULL,
    orden integer NOT NULL,
    color_hex text DEFAULT '#cccccc'::text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT prioridades_nombre_key UNIQUE (nombre),
    CONSTRAINT prioridades_orden_key UNIQUE (orden),
    CONSTRAINT prioridades_pkey PRIMARY KEY (id)
);

CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    email text NOT NULL,
    nombre_completo text NOT NULL,
    local_id uuid,
    rol_id uuid NOT NULL,
    estado text DEFAULT 'activo'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    supervisor_id uuid,
    departamento_id uuid,
    CONSTRAINT usuarios_email_key UNIQUE (email),
    CONSTRAINT usuarios_estado_check CHECK (estado = ANY (ARRAY['activo'::text, 'inactivo'::text])),
    CONSTRAINT usuarios_departamento_requiere_local CHECK (departamento_id IS NULL OR local_id IS NOT NULL),
    CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_local_id_fkey FOREIGN KEY (local_id) REFERENCES locales(id) ON DELETE SET NULL,
    CONSTRAINT usuarios_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES departamentos(id),
    CONSTRAINT usuarios_local_departamento_fkey FOREIGN KEY (local_id, departamento_id) REFERENCES locales_departamentos(local_id, departamento_id),
    CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
    CONSTRAINT usuarios_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE public.tareas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    local_id uuid NOT NULL,
    creado_por uuid NOT NULL,
    asignado_a uuid,
    supervisado_por uuid,
    estado_id uuid NOT NULL,
    prioridad_id uuid NOT NULL,
    fecha_inicio timestamp without time zone,
    fecha_limite timestamp without time zone NOT NULL,
    fecha_cierre timestamp without time zone,
    dias_retraso integer DEFAULT 0,
    porcentaje_avance integer DEFAULT 0,
    evidencia text,
    observaciones text,
    revisado boolean DEFAULT false,
    revisado_en timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    delegado_por uuid,
    delegado_de_usuario_id uuid,
    delegado_en timestamp without time zone,
    CONSTRAINT tareas_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT tareas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT tareas_delegado_de_usuario_id_fkey FOREIGN KEY (delegado_de_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT tareas_delegado_por_fkey FOREIGN KEY (delegado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT tareas_estado_id_fkey FOREIGN KEY (estado_id) REFERENCES estados_tarea(id) ON DELETE RESTRICT,
    CONSTRAINT tareas_pkey PRIMARY KEY (id),
    CONSTRAINT tareas_local_id_fkey FOREIGN KEY (local_id) REFERENCES locales(id) ON DELETE RESTRICT,
    CONSTRAINT tareas_porcentaje_avance_check CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    CONSTRAINT tareas_prioridad_id_fkey FOREIGN KEY (prioridad_id) REFERENCES prioridades(id) ON DELETE RESTRICT,
    CONSTRAINT tareas_supervisado_por_fkey FOREIGN KEY (supervisado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE public.comentarios_tarea (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tarea_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    contenido text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT comentarios_tarea_pkey PRIMARY KEY (id),
    CONSTRAINT comentarios_tarea_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    CONSTRAINT comentarios_tarea_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE TABLE public.evidencias_tareas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tarea_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    subido_por uuid,
    archivo_path text NOT NULL,
    archivo_url text NOT NULL,
    tipo_mime text,
    tamanio_bytes integer,
    descripcion text,
    fecha_subida timestamp without time zone DEFAULT now(),
    CONSTRAINT evidencias_tareas_pkey PRIMARY KEY (id),
    CONSTRAINT evidencias_tareas_subido_por_fkey FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT evidencias_tareas_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    CONSTRAINT evidencias_tareas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE public.alertas_usuario (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    creado_por uuid NOT NULL,
    mensaje text NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    enviada_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    confirmada_at timestamp with time zone,
    confirmada_por uuid,
    admin_resuelta_visible_hasta timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT alertas_usuario_confirmacion_consistente CHECK (activa = true AND confirmada_at IS NULL AND confirmada_por IS NULL OR activa = false AND confirmada_at IS NOT NULL AND confirmada_por IS NOT NULL),
    CONSTRAINT alertas_usuario_confirmada_por_fkey FOREIGN KEY (confirmada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT alertas_usuario_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT alertas_usuario_mensaje_no_vacio CHECK (length(btrim(mensaje)) >= 1 AND length(btrim(mensaje)) <= 500),
    CONSTRAINT alertas_usuario_pkey PRIMARY KEY (id),
    CONSTRAINT alertas_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Non-constraint indexes.
CREATE INDEX ix_alertas_usuario_admin_visible ON public.alertas_usuario USING btree (admin_resuelta_visible_hasta DESC) WHERE (admin_resuelta_visible_hasta IS NOT NULL);
CREATE INDEX ix_alertas_usuario_creado_por ON public.alertas_usuario USING btree (creado_por, enviada_at DESC);
CREATE INDEX ix_alertas_usuario_usuario_activa ON public.alertas_usuario USING btree (usuario_id, activa, enviada_at DESC);
CREATE UNIQUE INDEX ux_alertas_usuario_una_activa_por_usuario ON public.alertas_usuario USING btree (usuario_id) WHERE (activa = true);
CREATE INDEX idx_comentarios_tarea_id ON public.comentarios_tarea USING btree (tarea_id);
CREATE INDEX idx_comentarios_usuario_id ON public.comentarios_tarea USING btree (usuario_id);
CREATE UNIQUE INDEX departamentos_nombre_normalizado_key ON public.departamentos USING btree (lower(btrim(nombre)));
CREATE INDEX idx_evidencias_fecha ON public.evidencias_tareas USING btree (fecha_subida DESC);
CREATE INDEX idx_evidencias_tarea ON public.evidencias_tareas USING btree (tarea_id);
CREATE INDEX idx_evidencias_usuario ON public.evidencias_tareas USING btree (usuario_id);
CREATE INDEX idx_locales_pais_id ON public.locales USING btree (pais_id);
CREATE INDEX idx_locales_departamentos_departamento_id ON public.locales_departamentos USING btree (departamento_id);
CREATE INDEX idx_tareas_asignado_a ON public.tareas USING btree (asignado_a);
CREATE INDEX idx_tareas_creado_por ON public.tareas USING btree (creado_por);
CREATE INDEX idx_tareas_delegado_de ON public.tareas USING btree (delegado_de_usuario_id);
CREATE INDEX idx_tareas_delegado_por ON public.tareas USING btree (delegado_por);
CREATE INDEX idx_tareas_dias_retraso ON public.tareas USING btree (dias_retraso);
CREATE INDEX idx_tareas_estado_id ON public.tareas USING btree (estado_id);
CREATE INDEX idx_tareas_fecha_limite ON public.tareas USING btree (fecha_limite);
CREATE INDEX idx_tareas_local_id ON public.tareas USING btree (local_id);
CREATE INDEX idx_tareas_prioridad_id ON public.tareas USING btree (prioridad_id);
CREATE INDEX idx_usuarios_estado ON public.usuarios USING btree (estado);
CREATE INDEX idx_usuarios_departamento_id ON public.usuarios USING btree (departamento_id);
CREATE INDEX idx_usuarios_local_id ON public.usuarios USING btree (local_id);
CREATE INDEX idx_usuarios_rol_id ON public.usuarios USING btree (rol_id);
CREATE INDEX idx_usuarios_supervisor_id ON public.usuarios USING btree (supervisor_id);

-- Database functions.
CREATE OR REPLACE FUNCTION public.actualizar_dias_retraso_y_cierre()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  estado_completado_id UUID;
BEGIN
  -- Obtener el ID del estado 'completado'
  SELECT id INTO estado_completado_id FROM estados_tarea WHERE nombre = 'completado' LIMIT 1;
  
  -- Actualizar fecha_cierre si cambia a completado
  IF NEW.estado_id = estado_completado_id AND OLD.estado_id != estado_completado_id THEN
    NEW.fecha_cierre := NOW();
  END IF;
  
  -- Calcular dias_retraso
  IF NEW.fecha_limite < NOW() AND NEW.estado_id != estado_completado_id THEN
    NEW.dias_retraso := EXTRACT(DAY FROM NOW() - NEW.fecha_limite)::INTEGER;
  ELSE
    NEW.dias_retraso := 0;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.actualizar_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.confirmar_alerta_usuario(p_alerta_id uuid, p_usuario_id uuid)
 RETURNS alertas_usuario
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_alerta public.alertas_usuario;
begin
  update public.alertas_usuario
  set activa = false,
      confirmada_por = p_usuario_id,
      confirmada_at = timezone('utc', now()),
      admin_resuelta_visible_hasta = timezone('utc', now()) + interval '12 hours'
  where id = p_alerta_id
    and usuario_id = p_usuario_id
    and activa = true
  returning * into v_alerta;

  if v_alerta is null then
    raise exception 'No existe una alerta activa para confirmar con esos datos.';
  end if;
  return v_alerta;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.crear_alerta_usuario(p_usuario_id uuid, p_creado_por uuid, p_mensaje text)
 RETURNS alertas_usuario
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_alerta public.alertas_usuario;
begin
  insert into public.alertas_usuario (
    usuario_id,
    creado_por,
    mensaje
  )
  values (
    p_usuario_id,
    p_creado_por,
    p_mensaje
  )
  on conflict (usuario_id)
  where (activa = true)
  do update
    set mensaje = excluded.mensaje,
        creado_por = excluded.creado_por,
        activa = true,
        enviada_at = timezone('utc', now()),
        confirmada_at = null,
        confirmada_por = null,
        admin_resuelta_visible_hasta = null,
        updated_at = timezone('utc', now())
  returning * into v_alerta;

  return v_alerta;
end;
$function$
;

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
$function$
;

CREATE OR REPLACE FUNCTION public.es_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN obtener_rol_usuario() = 'admin';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.es_admin_por_id(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.usuarios u
    join public.roles r on r.id = u.rol_id
    where u.id = p_user_id
      and r.nombre = 'admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.es_supervisor()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN obtener_rol_usuario() = 'supervisor';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.es_usuario_por_id(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.usuarios u
    join public.roles r on r.id = u.rol_id
    where u.id = p_user_id
      and r.nombre = 'user'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.obtener_pais_usuario()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT p.pais_id 
    FROM usuarios u
    JOIN locales p ON u.local_id = p.id
    WHERE u.id = auth.uid() 
    LIMIT 1
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.obtener_local_usuario()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT local_id FROM usuarios WHERE id = auth.uid() LIMIT 1);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.obtener_rol_usuario()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT roles.nombre FROM usuarios 
          JOIN roles ON usuarios.rol_id = roles.id 
          WHERE usuarios.id = auth.uid() LIMIT 1);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_alertas_usuario_validar()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  new.mensaje := btrim(new.mensaje);

  if not public.es_admin_por_id(new.creado_por) then
    raise exception 'Solo un admin puede crear o gestionar alertas.';
  end if;

  if not public.es_usuario_por_id(new.usuario_id) then
    raise exception 'La alerta debe enviarse a un usuario con rol user.';
  end if;

  if tg_op = 'INSERT' then
    new.activa := true;
    new.enviada_at := coalesce(new.enviada_at, timezone('utc', now()));
    new.confirmada_at := null;
    new.confirmada_por := null;
    new.admin_resuelta_visible_hasta := null;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.usuario_id <> new.usuario_id then
      raise exception 'No se puede cambiar el usuario destino de una alerta.';
    end if;

    if old.creado_por <> new.creado_por then
      raise exception 'No se puede cambiar el creador de una alerta.';
    end if;

    if new.activa = true then
      new.confirmada_at := null;
      new.confirmada_por := null;
      new.admin_resuelta_visible_hasta := null;
      return new;
    end if;

    if new.confirmada_por is null then
      raise exception 'La alerta confirmada debe registrar quien la confirmo.';
    end if;

    if new.confirmada_por <> new.usuario_id then
      raise exception 'Solo el usuario destinatario puede confirmar la alerta.';
    end if;

    new.confirmada_at := coalesce(new.confirmada_at, timezone('utc', now()));
    new.admin_resuelta_visible_hasta := coalesce(
      new.admin_resuelta_visible_hasta,
      new.confirmada_at + interval '12 hours'
    );

    return new;
  end if;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_fecha_mod()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.fecha_mod = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE VIEW public.vw_alertas_usuario_estado AS SELECT a.id,
    a.usuario_id,
    u.nombre_completo AS usuario_nombre,
    u.email AS usuario_email,
    a.creado_por,
    uc.nombre_completo AS creado_por_nombre,
    a.mensaje,
    a.activa,
    a.enviada_at,
    a.confirmada_at,
    a.confirmada_por,
    a.admin_resuelta_visible_hasta,
        CASE
            WHEN a.activa THEN 'pendiente'::text
            WHEN ((a.admin_resuelta_visible_hasta IS NOT NULL) AND (a.admin_resuelta_visible_hasta > timezone('utc'::text, now()))) THEN 'confirmada_visible_admin'::text
            ELSE 'cerrada'::text
        END AS estado_visual_admin,
    a.activa AS mostrar_banner_user,
    (a.activa OR ((a.admin_resuelta_visible_hasta IS NOT NULL) AND (a.admin_resuelta_visible_hasta > timezone('utc'::text, now())))) AS mostrar_en_admin
   FROM ((alertas_usuario a
     JOIN usuarios u ON ((u.id = a.usuario_id)))
     JOIN usuarios uc ON ((uc.id = a.creado_por)));

-- Enable RLS as observed on source.
ALTER TABLE public.alertas_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_tarea ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locales_departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados_tarea ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencias_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prioridades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Policies from pg_policies.
CREATE POLICY "alertas_usuario_insert_admin" ON public."alertas_usuario" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((es_admin_por_id(auth.uid()) AND (creado_por = auth.uid())));
CREATE POLICY "alertas_usuario_select_admin" ON public."alertas_usuario" AS PERMISSIVE FOR SELECT TO "authenticated" USING (es_admin_por_id(auth.uid()));
CREATE POLICY "alertas_usuario_select_self" ON public."alertas_usuario" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((usuario_id = auth.uid()));
CREATE POLICY "alertas_usuario_update_admin" ON public."alertas_usuario" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (es_admin_por_id(auth.uid())) WITH CHECK (es_admin_por_id(auth.uid()));
CREATE POLICY "alertas_usuario_update_self_confirm" ON public."alertas_usuario" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((usuario_id = auth.uid()) AND (activa = true))) WITH CHECK (((usuario_id = auth.uid()) AND (activa = false) AND (confirmada_por = auth.uid())));
CREATE POLICY "comentarios_admin_full" ON public."comentarios_tarea" AS PERMISSIVE FOR ALL TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "comentarios_supervisor_insert" ON public."comentarios_tarea" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((es_supervisor() AND (usuario_id = auth.uid())));
CREATE POLICY "comentarios_supervisor_select" ON public."comentarios_tarea" AS PERMISSIVE FOR SELECT TO PUBLIC USING ((es_supervisor() AND (( SELECT tareas.local_id
   FROM tareas
  WHERE (tareas.id = comentarios_tarea.tarea_id)) = obtener_local_usuario())));
CREATE POLICY "comentarios_user_insert" ON public."comentarios_tarea" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (((usuario_id = auth.uid()) AND (tarea_id IN ( SELECT tareas.id
   FROM tareas
  WHERE (tareas.asignado_a = auth.uid())))));
CREATE POLICY "comentarios_user_select" ON public."comentarios_tarea" AS PERMISSIVE FOR SELECT TO PUBLIC USING ((tarea_id IN ( SELECT tareas.id
   FROM tareas
  WHERE ((tareas.asignado_a = auth.uid()) OR (tareas.creado_por = auth.uid())))));
CREATE POLICY "departamentos_admin_full" ON public."departamentos" AS PERMISSIVE FOR ALL TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "departamentos_select_all" ON public."departamentos" AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "locales_departamentos_admin_full" ON public."locales_departamentos" AS PERMISSIVE FOR ALL TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "locales_departamentos_select_all" ON public."locales_departamentos" AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "estados_tarea_admin_full" ON public."estados_tarea" AS PERMISSIVE FOR ALL TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "estados_tarea_select_all" ON public."estados_tarea" AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "evidencias_delete" ON public."evidencias_tareas" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((usuario_id = auth.uid()));
CREATE POLICY "evidencias_insert" ON public."evidencias_tareas" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((usuario_id = auth.uid()) AND (subido_por = auth.uid())));
CREATE POLICY "evidencias_select" ON public."evidencias_tareas" AS PERMISSIVE FOR SELECT TO PUBLIC USING (((usuario_id = auth.uid()) OR es_admin() OR (es_supervisor() AND (( SELECT tareas.local_id
   FROM tareas
  WHERE (tareas.id = evidencias_tareas.tarea_id)) = obtener_local_usuario()))));
CREATE POLICY "paises_select_all" ON public."paises" AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "locales_admin_full" ON public."locales" AS PERMISSIVE FOR ALL TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "locales_select_all" ON public."locales" AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "prioridades_admin_full" ON public."prioridades" AS PERMISSIVE FOR ALL TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "prioridades_select_all" ON public."prioridades" AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "roles_admin_full" ON public."roles" AS PERMISSIVE FOR ALL TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "roles_select_all" ON public."roles" AS PERMISSIVE FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "tareas_admin_full" ON public."tareas" AS PERMISSIVE FOR ALL TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "tareas_supervisor_delete_propias" ON public."tareas" AS PERMISSIVE FOR DELETE TO PUBLIC USING ((es_supervisor() AND (local_id = obtener_local_usuario())));
CREATE POLICY "tareas_supervisor_insert_propias" ON public."tareas" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ((es_supervisor() AND (local_id = obtener_local_usuario()) AND (creado_por = auth.uid())));
CREATE POLICY "tareas_supervisor_select_filtered" ON public."tareas" AS PERMISSIVE FOR SELECT TO PUBLIC USING ((es_supervisor() AND (local_id = obtener_local_usuario())));
CREATE POLICY "tareas_supervisor_update_propias" ON public."tareas" AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((es_supervisor() AND (local_id = obtener_local_usuario()))) WITH CHECK ((es_supervisor() AND (local_id = obtener_local_usuario())));
CREATE POLICY "tareas_user_select_propias" ON public."tareas" AS PERMISSIVE FOR SELECT TO PUBLIC USING (((asignado_a = auth.uid()) OR (creado_por = auth.uid())));
CREATE POLICY "tareas_user_update_propias" ON public."tareas" AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((asignado_a = auth.uid())) WITH CHECK ((asignado_a = auth.uid()));
CREATE POLICY "usuarios_admin_full" ON public."usuarios" AS PERMISSIVE FOR ALL TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "usuarios_delete_admin_only" ON public."usuarios" AS PERMISSIVE FOR DELETE TO PUBLIC USING (es_admin());
CREATE POLICY "usuarios_insert_admin_only" ON public."usuarios" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK (es_admin());
CREATE POLICY "usuarios_supervisor_select_filtered" ON public."usuarios" AS PERMISSIVE FOR SELECT TO PUBLIC USING ((es_supervisor() AND (( SELECT roles.nombre
   FROM roles
  WHERE (roles.id = usuarios.rol_id)) = 'user'::text) AND ((supervisor_id = auth.uid()) OR (supervisor_id IS NULL)) AND (( SELECT locales.pais_id
   FROM locales
  WHERE (locales.id = usuarios.local_id)) = obtener_pais_usuario())));
CREATE POLICY "usuarios_supervisor_update_asignados" ON public."usuarios" AS PERMISSIVE FOR UPDATE TO PUBLIC USING ((es_supervisor() AND (( SELECT roles.nombre
   FROM roles
  WHERE (roles.id = usuarios.rol_id)) = 'user'::text) AND ((supervisor_id = auth.uid()) OR (supervisor_id IS NULL)) AND (( SELECT locales.pais_id
   FROM locales
  WHERE (locales.id = usuarios.local_id)) = obtener_pais_usuario()))) WITH CHECK ((es_supervisor() AND (( SELECT roles.nombre
   FROM roles
  WHERE (roles.id = usuarios.rol_id)) = 'user'::text) AND ((supervisor_id = auth.uid()) OR (supervisor_id IS NULL)) AND (( SELECT locales.pais_id
   FROM locales
  WHERE (locales.id = usuarios.local_id)) = obtener_pais_usuario())));
CREATE POLICY "usuarios_update_admin_only" ON public."usuarios" AS PERMISSIVE FOR UPDATE TO PUBLIC USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "usuarios_user_select_self" ON public."usuarios" AS PERMISSIVE FOR SELECT TO PUBLIC USING (((auth.uid() = id) OR ((obtener_local_usuario() IS NOT NULL) AND (obtener_local_usuario() = local_id))));

-- Triggers.
CREATE TRIGGER trg_alertas_usuario_updated_at BEFORE UPDATE ON alertas_usuario FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_alertas_usuario_validar BEFORE INSERT OR UPDATE ON alertas_usuario FOR EACH ROW EXECUTE FUNCTION tg_alertas_usuario_validar();
CREATE TRIGGER trigger_actualizar_comentarios BEFORE UPDATE ON comentarios_tarea FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_actualizar_tareas BEFORE INSERT OR UPDATE ON tareas FOR EACH ROW EXECUTE FUNCTION actualizar_dias_retraso_y_cierre();

-- Source table, sequence, and function grants.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON TABLE public.alertas_usuario FROM anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.guardar_departamento(uuid, text, uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guardar_departamento(uuid, text, uuid[]) TO service_role;

-- Bucket metadata only; no Storage files or bucket policies exist in this source snapshot.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES ('evidencias-tareas','evidencias-tareas',true,10485760,NULL) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, public=EXCLUDED.public, file_size_limit=EXCLUDED.file_size_limit, allowed_mime_types=EXCLUDED.allowed_mime_types;

-- Source publication includes tareas and alertas_usuario.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tareas') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tareas;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='alertas_usuario') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alertas_usuario;
  END IF;
END $$;

COMMIT;
