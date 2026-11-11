BEGIN;

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_departamento_id_fkey
  FOREIGN KEY (departamento_id)
  REFERENCES public.departamentos(id);

NOTIFY pgrst, 'reload schema';

COMMIT;
