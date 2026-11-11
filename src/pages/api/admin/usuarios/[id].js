import { verifyAdminOrSupervisorToken, supabaseAdmin } from '@lib/apiHelpers';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const verify = await verifyAdminOrSupervisorToken(authHeader);

  if (!verify.isValid) {
    return res.status(403).json({ error: 'Forbidden', detail: verify.reason });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'User ID required' });
  }

  try {
    if (req.method === 'PUT') {
      const {
        nombre_completo,
        rol_id,
        local_id,
        departamento_id,
        estado,
        password,
        supervisor_id,
      } = req.body;

      if (verify.rol === 'supervisor') {
        const camposPermitidos = ['local_id', 'supervisor_id'];
        const camposRecibidos = Object.keys(req.body || {});
        const tieneCampoNoPermitido = camposRecibidos.some(
          (campo) => !camposPermitidos.includes(campo)
        );

        if (tieneCampoNoPermitido) {
          return res.status(403).json({
            error: 'Forbidden',
            detail: 'Supervisor solo puede cambiar local_id o supervisor_id',
          });
        }

        if (id === verify.userId) {
          return res.status(403).json({
            error: 'Forbidden',
            detail: 'Supervisor no puede modificarse a sí mismo',
          });
        }

        const { data: localSupervisor, error: localSupervisorErr } =
          await supabaseAdmin
            .from('locales')
            .select('pais_id')
            .eq('id', verify.local_id)
            .single();

        if (localSupervisorErr || !localSupervisor) {
          return res.status(403).json({
            error: 'Forbidden',
            detail: 'Supervisor sin local válido',
          });
        }

        const { data: usuarioDestino, error: usuarioErr } = await supabaseAdmin
          .from('usuarios')
          .select(
            'id, local_id, rol:roles(nombre), local:locales!inner(pais_id)'
          )
          .eq('id', id)
          .single();

        if (usuarioErr || !usuarioDestino) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (usuarioDestino.rol?.nombre !== 'user') {
          return res.status(403).json({
            error: 'Forbidden',
            detail: 'Supervisor solo puede modificar usuarios operativos',
          });
        }

        if (usuarioDestino.local?.pais_id !== localSupervisor.pais_id) {
          return res.status(403).json({
            error: 'Forbidden',
            detail: 'Supervisor solo puede gestionar usuarios de su país',
          });
        }

        // Construir objeto de actualización
        const updateData = {};

        // Si actualiza local_id
        if (local_id !== undefined) {
          const { data: nuevaLocal, error: localErr } = await supabaseAdmin
            .from('locales')
            .select('id, pais_id')
            .eq('id', local_id)
            .single();

          if (localErr || !nuevaLocal) {
            return res.status(404).json({ error: 'Local no encontrada' });
          }

          if (nuevaLocal.pais_id !== localSupervisor.pais_id) {
            return res.status(403).json({
              error: 'Forbidden',
              detail: 'Supervisor solo puede asignar locales de su país',
            });
          }

          updateData.local_id = local_id;
          if (usuarioDestino.local_id !== local_id) {
            updateData.departamento_id = null;
          }
        }

        // Si actualiza supervisor_id
        if (supervisor_id !== undefined) {
          // Solo puede asignarse a sí mismo o dejar NULL
          if (supervisor_id !== null && supervisor_id !== verify.userId) {
            return res.status(403).json({
              error: 'Forbidden',
              detail: 'Solo puedes asignarte a ti mismo como supervisor',
            });
          }
          updateData.supervisor_id = supervisor_id;
        }

        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .update(updateData)
          .eq('id', id)
          .select(
            `
            *,
            rol:roles(id, nombre),
            local:locales(id, nombre, pais_id, pais:paises(id, nombre)),
            departamento:departamentos!usuarios_departamento_id_fkey(id, nombre)
          `
          );

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({
          success: true,
          message: 'Usuario actualizado exitosamente',
          data: data[0],
        });
      }

      // Si se envía password, actualizar en Auth
      if (password) {
        const { error: authError } =
          await supabaseAdmin.auth.admin.updateUserById(id, { password });

        if (authError) {
          return res.status(400).json({
            error: 'AUTH_ERROR',
            detail: authError.message,
          });
        }
      }

      // Actualizar en tabla usuarios
      const updateData = {};
      if (nombre_completo !== undefined)
        updateData.nombre_completo = nombre_completo;
      if (rol_id !== undefined) updateData.rol_id = rol_id;
      if (local_id !== undefined) {
        updateData.local_id = local_id || null;
        if (departamento_id === undefined) {
          const { data: usuarioActual, error: usuarioActualError } =
            await supabaseAdmin
              .from('usuarios')
              .select('local_id')
              .eq('id', id)
              .maybeSingle();

          if (usuarioActualError) {
            return res.status(400).json({ error: usuarioActualError.message });
          }

          if (usuarioActual?.local_id !== (local_id || null)) {
            updateData.departamento_id = null;
          }
        }
      }
      if (departamento_id !== undefined)
        updateData.departamento_id = departamento_id || null;
      if (estado !== undefined) updateData.estado = estado;
      if (supervisor_id !== undefined) updateData.supervisor_id = supervisor_id;

      const { data, error } = await supabaseAdmin
        .from('usuarios')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          rol:roles(id, nombre),
          local:locales(id, nombre),
          departamento:departamentos!usuarios_departamento_id_fkey(id, nombre)
        `
        );

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: data[0],
      });
    }

    if (req.method === 'DELETE') {
      if (verify.rol !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          detail: 'Solo admin puede eliminar usuarios',
        });
      }

      // Primero eliminar de BD
      const { error: dbError } = await supabaseAdmin
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (dbError) {
        return res.status(400).json({ error: dbError.message });
      }

      // Luego eliminar de Auth
      const { error: authError } =
        await supabaseAdmin.auth.admin.deleteUser(id);

      if (authError) {
        // Log pero no fallar (usuario ya está en BD)
        console.warn('Auth delete failed:', authError);
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
