import { verifyAdminToken, supabaseAdmin } from '@lib/apiHelpers';
import {
  normalizarNombreCatalogo,
  esColorHexValido,
  mensajeErrorCatalogo,
} from '@lib/catalogosTareas';

export default async function handler(req, res) {
  const verify = await verifyAdminToken(req.headers.authorization);

  if (!verify.isValid) {
    return res.status(403).json({ error: 'Forbidden', detail: verify.reason });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('prioridades')
        .select('id, nombre, orden, color_hex')
        .order('orden', { ascending: true });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

    if (req.method === 'POST') {
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

      // `orden` es NOT NULL y UNIQUE: la nueva prioridad va al final.
      const { data: ultima, error: errorOrden } = await supabaseAdmin
        .from('prioridades')
        .select('orden')
        .order('orden', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (errorOrden) {
        return res.status(400).json({ error: errorOrden.message });
      }

      const { data, error } = await supabaseAdmin
        .from('prioridades')
        .insert({ nombre, color_hex, orden: (ultima?.orden || 0) + 1 })
        .select('id, nombre, orden, color_hex')
        .single();

      if (error) {
        return res
          .status(400)
          .json({ error: mensajeErrorCatalogo(error, 'una prioridad') });
      }

      return res.status(201).json({ success: true, data });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
