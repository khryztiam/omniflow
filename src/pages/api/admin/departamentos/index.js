import { verifyAdminToken, supabaseAdmin } from '@lib/apiHelpers';
import { normalizarLocales } from '@lib/departamentos';

export default async function handler(req, res) {
  const verify = await verifyAdminToken(req.headers.authorization);

  if (!verify.isValid) {
    return res.status(403).json({ error: 'Forbidden', detail: verify.reason });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('departamentos')
        .select(
          'id, nombre, created_at, updated_at, locales_departamentos(local_id, local:locales(id, nombre, pais_id))'
        )
        .order('nombre', { ascending: true });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    if (req.method === 'POST') {
      const nombre = req.body?.nombre?.trim();
      const localIds = normalizarLocales(req.body?.local_ids);

      if (!nombre || !localIds?.length) {
        return res.status(400).json({
          error: 'El nombre y al menos un local son obligatorios.',
        });
      }

      const { data: id, error } = await supabaseAdmin.rpc(
        'guardar_departamento',
        {
          p_departamento_id: null,
          p_nombre: nombre,
          p_local_ids: localIds,
        }
      );

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const { data, error: loadError } = await supabaseAdmin
        .from('departamentos')
        .select(
          'id, nombre, created_at, updated_at, locales_departamentos(local_id, local:locales(id, nombre, pais_id))'
        )
        .eq('id', id)
        .single();

      if (loadError) {
        return res.status(500).json({
          error:
            'El departamento se guardó, pero no se pudo cargar el resultado.',
          detail: loadError.message,
        });
      }

      return res.status(201).json({ success: true, data });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Server error', detail: error.message });
  }
}
