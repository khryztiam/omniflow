import Layout from '@components/Layout';
import { useAdmin } from '@hooks/useProtegerRuta';
import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import styles from '@styles/AsignacionesAdmin.module.css';

export default function AsignacionesAdmin() {
  const { cargando: cargandoAuth } = useAdmin();
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [locales, setLocales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('todas');
  const [asignando, setAsignando] = useState(null);

  useEffect(() => {
    if (!cargandoAuth) {
      cargarDatos();
    }
  }, [cargandoAuth]);

  // Obtener token del usuario actual
  const obtenerToken = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.access_token) {
      throw new Error('No autenticado');
    }
    return data.session.access_token;
  };

  const callAPI = async (url, method = 'GET', body = null) => {
    const token = await obtenerToken();
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || response.statusText);
    }

    return response.json();
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');

      // Cargar locales
      const { data: localesData, error: localesErr } = await supabase
        .from('locales')
        .select('id, nombre');

      if (localesErr) throw localesErr;
      setLocales(
        (localesData || []).map((p) => ({
          ...p,
          nombre: p.nombre.toUpperCase(),
        }))
      );

      // Cargar tareas sin asignar de todos los locales
      const { data: tareasData, error: tareasErr } = await supabase
        .from('tareas')
        .select(
          '*, local:locales(id, nombre), prioridad:prioridades(id, nombre)'
        )
        .is('asignado_a', null)
        .order('fecha_limite', { ascending: true });

      if (tareasErr) throw tareasErr;
      setTareas(tareasData || []);

      // Cargar todos los usuarios para asignar
      const { data: usuariosData, error: usuariosErr } = await supabase
        .from('usuarios')
        .select('id, nombre_completo, email, local:locales(id, nombre)')
        .eq('estado', 'activo');

      if (usuariosErr) throw usuariosErr;
      setUsuarios(usuariosData || []);
    } catch (err) {
      setError(`Error cargando datos: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  const tareasFiltradas =
    filtroLocal === 'todas'
      ? tareas
      : tareas.filter((t) => t.local_id === filtroLocal);

  const handleAsignar = async (tareaId, usuarioId) => {
    if (!usuarioId) return;

    try {
      setError('');
      setSuccess('');
      setAsignando(tareaId);

      const result = await callAPI('/api/admin/asignar', 'POST', {
        tarea_id: tareaId,
        usuario_id: usuarioId,
      });

      setSuccess(result.message || 'Tarea asignada exitosamente');
      setTareas(tareas.filter((t) => t.id !== tareaId));

      // Limpiar éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Error asignando tarea: ${err.message}`);
    } finally {
      setAsignando(null);
    }
  };

  if (cargandoAuth || cargando) {
    return <Layout titulo="Asignaciones">Cargando...</Layout>;
  }

  return (
    <Layout titulo="Gestión Global de Asignaciones (Admin)" ocultarHeader>
      <section className={styles.hero}>
        <div>
          <p className={styles.heroKicker}>Operacion global</p>
          <h1 className={styles.heroTitulo}>Asignacion centralizada</h1>
          <p className={styles.heroSubtitulo}>
            Distribuye tareas pendientes entre responsables activos con una
            vista unificada por local para mantener el flujo operativo en
            movimiento.
          </p>
        </div>
      </section>

      <div className={styles.contenedor}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.encabezado}>
          <div className={styles.titulo}>
            <p className={styles.eyebrow}>Bandeja de asignacion</p>
            <h3>Tareas</h3>
            <p className={styles.contador}>
              {filtroLocal === 'todas'
                ? 'Todos los locales'
                : 'Filtrado por local seleccionada'}{' '}
              · {tareasFiltradas.length} tareas en vista
            </p>
          </div>
        </div>

        <div className={styles.filtros}>
          <select
            className={styles.select}
            value={filtroLocal}
            onChange={(e) => setFiltroLocal(e.target.value)}
          >
            <option value="todas">📋 TODOS LOS LOCALES</option>
            {locales.map((p) => (
              <option key={p.id} value={p.id}>
                🏭 {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {tareasFiltradas.length === 0 ? (
          <div className={styles.vacio}>
            <p>✅ Todas las tareas han sido asignadas</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {tareasFiltradas.map((tarea) => (
              <div key={tarea.id} className={styles.tarjeta}>
                <div className={styles.encabezadoTarjeta}>
                  <div>
                    <h4 className={styles.titulo}>{tarea.titulo}</h4>
                    <p className={styles.local}>🏭 {tarea.local?.nombre}</p>
                  </div>
                  <span className={styles.prioridad}>
                    {tarea.prioridad?.nombre || 'N/A'}
                  </span>
                </div>

                <p className={styles.descripcion}>{tarea.descripcion}</p>

                <div className={styles.info}>
                  <span>
                    📅 {new Date(tarea.fecha_limite).toLocaleDateString()}
                  </span>
                </div>

                <div className={styles.usuarios}>
                  <label>Asignar a:</label>
                  <select
                    className={styles.selectAsignar}
                    onChange={(e) => handleAsignar(tarea.id, e.target.value)}
                    defaultValue=""
                    disabled={asignando === tarea.id}
                  >
                    <option value="">
                      {asignando === tarea.id
                        ? '⏳ Asignando...'
                        : '-- Seleccionar usuario --'}
                    </option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre_completo} ({u.local?.nombre})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
