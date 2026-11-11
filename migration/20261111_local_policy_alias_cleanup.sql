BEGIN;

DROP POLICY comentarios_supervisor_select ON public.comentarios_tarea;
CREATE POLICY comentarios_supervisor_select
  ON public.comentarios_tarea
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    es_supervisor()
    AND (
      SELECT tareas.local_id
      FROM public.tareas
      WHERE tareas.id = comentarios_tarea.tarea_id
    ) = obtener_local_usuario()
  );

DROP POLICY evidencias_select ON public.evidencias_tareas;
CREATE POLICY evidencias_select
  ON public.evidencias_tareas
  AS PERMISSIVE
  FOR SELECT
  TO PUBLIC
  USING (
    usuario_id = auth.uid()
    OR es_admin()
    OR (
      es_supervisor()
      AND (
        SELECT tareas.local_id
        FROM public.tareas
        WHERE tareas.id = evidencias_tareas.tarea_id
      ) = obtener_local_usuario()
    )
  );

COMMIT;
