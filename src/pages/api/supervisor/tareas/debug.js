import { verifyAdminOrSupervisorToken, supabaseAdmin } from '@lib/apiHelpers';

/**
 * DEBUG: GET /api/supervisor/tareas/debug
 * Devuelve información diagnostica sin RLS
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  const verify = await verifyAdminOrSupervisorToken(authHeader);

  if (!verify.isValid) {
    return res.status(403).json({ error: 'Forbidden', detail: verify.reason });
  }

  if (verify.rol !== 'supervisor') {
    return res.status(403).json({
      error: 'Forbidden',
      detail: 'Solo supervisores',
    });
  }

  try {
    const supervisorId = verify.userId;
    const localId = verify.local_id;

    console.log(`[DEBUG] supervisor=${supervisorId}, local=${localId}`);

    // 1. Verificar supervisor existe y tiene local
    const { data: supervisor, error: errSuper } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre_completo, local_id')
      .eq('id', supervisorId)
      .single();

    console.log(`[DEBUG] Supervisor en BD:`, supervisor || 'NO ENCONTRADO');

    // 2. Contar total tareas en BD
    const { count: totalTareas, error: errTotal } = await supabaseAdmin
      .from('tareas')
      .select('id', { count: 'exact', head: true });

    console.log(`[DEBUG] Total tareas en BD: ${totalTareas}`);

    // 3. Contar tareas creadas por supervisor
    const { data: tareasCreadas, error: errCreadas } = await supabaseAdmin
      .from('tareas')
      .select('id, titulo')
      .eq('creado_por', supervisorId);

    console.log(
      `[DEBUG] Tareas creadas por supervisor: ${tareasCreadas?.length || 0}`
    );
    if (tareasCreadas?.length) {
      console.log(`[DEBUG]   IDs:`, tareasCreadas.map((t) => t.id).join(', '));
    }

    // 4. Contar tareas supervisadas
    const { data: tareasSupervisadas, error: errSupervisadas } =
      await supabaseAdmin
        .from('tareas')
        .select('id, titulo')
        .eq('supervisado_por', supervisorId);

    console.log(
      `[DEBUG] Tareas supervisadas: ${tareasSupervisadas?.length || 0}`
    );
    if (tareasSupervisadas?.length) {
      console.log(
        `[DEBUG]   IDs:`,
        tareasSupervisadas.map((t) => t.id).join(', ')
      );
    }

    // 5. Contar usuarios supervisados
    const { data: usuariosSupervisados, error: errUsuarios } =
      await supabaseAdmin
        .from('usuarios')
        .select('id, nombre_completo')
        .eq('supervisor_id', supervisorId)
        .eq('local_id', localId);

    console.log(
      `[DEBUG] Usuarios supervisados: ${usuariosSupervisados?.length || 0}`
    );
    if (usuariosSupervisados?.length) {
      console.log(
        `[DEBUG]   Usuarios:`,
        usuariosSupervisados.map((u) => u.nombre_completo).join(', ')
      );
    }

    // 6. Mostrar todas las tareas (sin filtro) del local
    const { data: tareasLocal, error: errLocal } = await supabaseAdmin
      .from('tareas')
      .select('id, titulo, creado_por, supervisado_por, local_id')
      .eq('local_id', localId)
      .limit(5);

    console.log(
      `[DEBUG] Primeras 5 tareas del local ${localId}:`,
      tareasLocal || []
    );

    return res.status(200).json({
      debug: {
        supervisorId,
        localId,
        supervisorEnBD: !!supervisor,
        usuariosSupervisados: usuariosSupervisados?.length || 0,
        totalTareasEnBD: totalTareas,
        tareasCreadas: tareasCreadas?.length || 0,
        tareasSupervisadas: tareasSupervisadas?.length || 0,
        tareasDelLocalTotal: tareasLocal?.length || 0,
        usuariosDetalle: usuariosSupervisados || [],
        errors: {
          errUsuarios: errUsuarios?.message,
          errCreadas: errCreadas?.message,
          errSupervisadas: errSupervisadas?.message,
          errLocal: errLocal?.message,
        },
        muestras: {
          tareasCreadas: tareasCreadas?.slice(0, 3),
          tareasSupervisadas: tareasSupervisadas?.slice(0, 3),
          tareasLocal: tareasLocal,
        },
      },
    });
  } catch (err) {
    console.error('[DEBUG] Exception:', err);
    return res.status(500).json({
      error: err.message,
    });
  }
}
