import { verifyAdminToken, supabaseAdmin } from '@lib/apiHelpers';
import { normalizarLocales } from '@lib/departamentos';

export default async function handler(req, res) {
  const verify = await verifyAdminToken(req.headers.authorization);

  if (!verify.isValid) {
    return res.status(403).json({ error: 'Forbidden', detail: verify.reason });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Department ID required' });
  }

  try {
    if (req.method === 'PUT') {
      const nombre = req.body?.nombre?.trim();
      const localIds = normalizarLocales(req.body?.local_ids);

      if (!nombre || !localIds?.length) {
        return res.status(400).json({
          error: 'El nombre y al menos un local son obligatorios.',
        });
      }

      const { data: savedId, error } = await supabaseAdmin.rpc(
        'guardar_departamento',
        {
          p_departamento_id: id,
          p_nombre: nombre,
          p_local_ids: localIds,
        }
      );

      if (error) {
        const detail = error.message.includes(
          'usuarios_local_departamento_fkey'
        )
          ? 'No se puede quitar el departamento de un local mientras haya usuarios asignados a esa combinación.'
          : error.message;
        return res.status(400).json({ error: detail });
      }

      const { data, error: loadError } = await supabaseAdmin
        .from('departamentos')
        .select(
          'id, nombre, created_at, updated_at, locales_departamentos(local_id, local:locales(id, nombre, pais_id))'
        )
        .eq('id', savedId)
        .single();

      if (loadError) {
        return res.status(500).json({
          error:
            'El departamento se guardó, pero no se pudo cargar el resultado.',
          detail: loadError.message,
        });
      }

      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'DELETE') {
      const { error } = await supabaseAdmin
        .from('departamentos')
        .delete()
        .eq('id', id);

      if (error) {
        const detail = error.message.includes(
          'usuarios_local_departamento_fkey'
        )
          ? 'No se puede eliminar un departamento asignado a usuarios.'
          : error.message;
        return res.status(400).json({ error: detail });
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Server error', detail: error.message });
  }
}
