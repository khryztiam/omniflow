import { verifyAdminOrSupervisorToken, supabaseAdmin } from '@lib/apiHelpers';

/**
 * POST /api/admin/asignar
 * Asigna una tarea a un usuario (validación de permisos por rol)
 *
 * Body: { tarea_id, usuario_id, supervisado_por? }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  const verify = await verifyAdminOrSupervisorToken(authHeader);

  if (!verify.isValid) {
    return res.status(403).json({ error: 'Forbidden', detail: verify.reason });
  }

  try {
    const { tarea_id, usuario_id, supervisado_por } = req.body;

    if (!tarea_id || !usuario_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        detail: 'tarea_id y usuario_id son requeridos',
      });
    }

    // Obtener tarea actual para validar local
    const { data: tarea, error: fetchTareaErr } = await supabaseAdmin
      .from('tareas')
      .select('id, local_id, asignado_a')
      .eq('id', tarea_id)
      .single();

    if (fetchTareaErr || !tarea) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Si supervisor, validar que la tarea sea de su local
    if (verify.rol === 'supervisor' && tarea.local_id !== verify.local_id) {
      return res.status(403).json({
        error: 'Forbidden',
        detail: 'Supervisores solo pueden asignar tareas de su local',
      });
    }

    // Validar que el usuario existe y es de la misma local
    const { data: usuario, error: fetchUsuarioErr } = await supabaseAdmin
      .from('usuarios')
      .select('id, local_id, estado')
      .eq('id', usuario_id)
      .single();

    if (fetchUsuarioErr || !usuario) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (usuario.estado !== 'activo') {
      return res.status(400).json({
        error: 'Invalid user',
        detail: 'El usuario no está activo',
      });
    }

    // Validar que el usuario sea de la misma local (si NO es admin)
    if (verify.rol !== 'admin' && usuario.local_id !== tarea.local_id) {
      return res.status(400).json({
        error: 'Invalid assignment',
        detail: 'El usuario debe ser de la misma local que la tarea',
      });
    }

    // Actualizar tarea
    const updateData = {
      asignado_a: usuario_id,
    };

    // Si se especifica supervisado_por, agregarlo
    if (supervisado_por) {
      const { data: supervisor } = await supabaseAdmin
        .from('usuarios')
        .select('id')
        .eq('id', supervisado_por)
        .single();

      if (supervisor) {
        updateData.supervisado_por = supervisado_por;
      }
    }

    const { data: updatedTarea, error: updateErr } = await supabaseAdmin
      .from('tareas')
      .update(updateData)
      .eq('id', tarea_id)
      .select(
        `
        *,
        asignado_a_user:usuarios!asignado_a(id, nombre_completo, email),
        supervisado_por_user:usuarios!supervisado_por(id, nombre_completo),
        local:locales(nombre),
        prioridad:prioridades(nombre)
      `
      );

    if (updateErr) {
      return res.status(400).json({
        error: 'DB_ERROR',
        detail: updateErr.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Tarea asignada a ${usuario.nombre_completo || 'usuario'}`,
      data: updatedTarea[0],
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message,
    });
  }
}
