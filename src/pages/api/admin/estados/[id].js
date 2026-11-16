import { verifyAdminToken, supabaseAdmin } from '@lib/apiHelpers';
import {
  ESTADOS_BASE,
  normalizarNombreCatalogo,
  esColorHexValido,
  mensajeErrorCatalogo,
} from '@lib/catalogosTareas';

export default async function handler(req, res) {
  const verify = await verifyAdminToken(req.headers.authorization);

  if (!verify.isValid) {
    return res.status(403).json({ error: 'Forbidden', detail: verify.reason });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID de estado requerido.' });
  }

  try {
    const { data: actual, error: errorActual } = await supabaseAdmin
      .from('estados_tarea')
      .select('id, nombre')
      .eq('id', id)
      .single();

    if (errorActual || !actual) {
      return res.status(404).json({ error: 'Estado no encontrado.' });
    }

    const esBase = ESTADOS_BASE.includes(actual.nombre);

    if (req.method === 'PUT') {
      const nombre = normalizarNombreCatalogo(req.body?.nombre);
      const { color_hex } = req.body || {};

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio.' });
      }
      if (!esColorHexValido(color_hex)) {
        return res
          .status(400)
          .json({ error: 'El color debe tener formato #RRGGBB.' });
      }
      if (esBase && nombre !== actual.nombre) {
        return res.status(400).json({
          error: 'Este estado es del sistema: solo se puede cambiar su color.',
        });
      }

      const { data, error } = await supabaseAdmin
        .from('estados_tarea')
        .update({ nombre, color_hex })
        .eq('id', id)
        .select('id, nombre, color_hex')
        .single();

      if (error) {
        return res
          .status(400)
          .json({ error: mensajeErrorCatalogo(error, 'un estado') });
      }

      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'DELETE') {
      if (esBase) {
        return res
          .status(400)
          .json({
            error: 'Este estado es del sistema y no se puede eliminar.',
          });
      }

      const { error } = await supabaseAdmin
        .from('estados_tarea')
        .delete()
        .eq('id', id);

      if (error) {
        return res
          .status(400)
          .json({ error: mensajeErrorCatalogo(error, 'este estado') });
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
