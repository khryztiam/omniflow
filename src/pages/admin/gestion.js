import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@components/Layout';
import TablaGenerica from '@components/TablaGenerica';
import Modal from '@components/Modal';
import FormularioMulti from '@components/FormularioMulti';
import { useAdmin } from '@hooks/useProtegerRuta';
import { supabase } from '@lib/supabase';
import { FiGlobe, FiSettings, FiShield, FiUsers } from 'react-icons/fi';
import styles from '@styles/GestionAdmin.module.css';

// Catálogos de tareas gestionados desde esta pantalla
const CATALOGOS_TAREA = {
  estados: { endpoint: '/api/admin/estados', singular: 'estado' },
  prioridades: { endpoint: '/api/admin/prioridades', singular: 'prioridad' },
};

const TITULOS_TIPO = {
  paises: 'País',
  locales: 'Local',
  departamentos: 'Departamento',
  estados: 'Estado',
  prioridades: 'Prioridad',
  usuarios: 'Usuario',
};

const formatearNombreCatalogo = (nombre) =>
  (nombre || '').replaceAll('_', ' ').toUpperCase();

export default function GestionAdmin() {
  const { cargando: cargandoAuth } = useAdmin();
  const montadoRef = useRef(true);

  const [cargando, setCargando] = useState(true);

  // Estados para datos
  const [paises, setPaises] = useState([]);
  const [locales, setLocales] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  // Modal y formulario
  const [modalAbierta, setModalAbierta] = useState(false);
  const [modoFormulario, setModoFormulario] = useState('crear');
  const [tipoFormulario, setTipoFormulario] = useState('usuarios');
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [error, setError] = useState('');
  const [cargandoFormulario, setCargandoFormulario] = useState(false);

  // Valores del formulario
  const [valores, setValores] = useState({});

  // Obtener token del usuario actual
  const obtenerToken = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.access_token) {
      throw new Error('No autenticado');
    }
    return data.session.access_token;
  }, []);

  const callAPI = useCallback(
    async (url, method = 'GET', body = null) => {
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
    },
    [obtenerToken]
  );

  const cargarDatos = useCallback(async () => {
    try {
      // Cargar datos desde APIs + obtener roles desde supabase
      const [
        paisesRes,
        localesRes,
        departamentosRes,
        usuariosRes,
        rolesRes,
        estadosRes,
        prioridadesRes,
      ] = await Promise.all([
        callAPI('/api/admin/paises'),
        callAPI('/api/admin/locales'),
        callAPI('/api/admin/departamentos'),
        callAPI('/api/admin/usuarios'),
        supabase.from('roles').select('id, nombre').order('nombre'),
        callAPI(CATALOGOS_TAREA.estados.endpoint),
        callAPI(CATALOGOS_TAREA.prioridades.endpoint),
      ]);

      if (montadoRef.current) {
        setPaises(paisesRes.data || []);
        setLocales(localesRes.data || []);
        setDepartamentos(departamentosRes.data || []);
        setUsuarios(usuariosRes.data || []);
        setEstados(estadosRes.data || []);
        setPrioridades(prioridadesRes.data || []);

        if (rolesRes.error) throw rolesRes.error;
        setRoles(rolesRes.data || []);
      }
    } catch (err) {
      if (montadoRef.current) setError(err.message || 'Error cargando datos');
    } finally {
      if (montadoRef.current) setCargando(false);
    }
  }, [callAPI]);

  const refrescarDatos = () => {
    setCargando(true);
    setError('');
    cargarDatos();
  };

  // Cargar datos al montar
  useEffect(() => {
    let activo = true;
    montadoRef.current = true;
    if (!cargandoAuth) {
      Promise.resolve().then(() => {
        if (activo) cargarDatos();
      });
    }
    return () => {
      activo = false;
      montadoRef.current = false;
    };
  }, [cargandoAuth, cargarDatos]);

  const handleNuevo = (tipo = 'usuarios') => {
    setTipoFormulario(tipo);
    setModoFormulario('crear');
    setRegistroSeleccionado(null);
    setValores(CATALOGOS_TAREA[tipo] ? { color_hex: '#2196F3' } : {});
    setError('');
    setModalAbierta(true);
  };

  const handleEditar = (registro, tipo = 'usuarios') => {
    setTipoFormulario(tipo);
    setModoFormulario('editar');
    setRegistroSeleccionado(registro);
    setValores(
      tipo === 'departamentos'
        ? {
            ...registro,
            local_ids:
              registro.locales_departamentos?.map(
                (relacion) => relacion.local_id
              ) || [],
          }
        : registro
    );
    setError('');
    setModalAbierta(true);
  };

  const handleCambioFormulario = (field, value) => {
    setValores((actuales) => ({
      ...actuales,
      [field]: value,
      ...(field === 'local_id' ? { departamento_id: '' } : {}),
    }));
  };

  const obtenerMensajeError = (err, accion = 'guardar') => {
    const mensaje = err?.message || '';

    if (
      mensaje.includes('tareas_local_id_fkey') &&
      mensaje.includes('table "tareas"')
    ) {
      return 'No se puede eliminar el local porque tiene tareas asociadas.';
    }

    if (
      mensaje.includes('locales_pais_id_fkey') &&
      mensaje.includes('table "locales"')
    ) {
      return 'No se puede eliminar el país porque tiene locales asociados.';
    }

    if (mensaje.includes('usuarios_local_departamento_fkey')) {
      return 'No se puede eliminar el local porque tiene usuarios con un departamento asignado.';
    }

    return accion === 'eliminar'
      ? 'No fue posible eliminar el registro.'
      : 'No fue posible guardar los cambios.';
  };

  const handleEliminar = async (registro, tipo = 'usuarios') => {
    const nombreTipo = (TITULOS_TIPO[tipo] || 'Usuario').toLowerCase();
    if (!confirm(`¿Eliminar ${nombreTipo}?`)) return;

    try {
      setCargandoFormulario(true);
      setError('');

      const endpoint = CATALOGOS_TAREA[tipo]
        ? `${CATALOGOS_TAREA[tipo].endpoint}/${registro.id}`
        : tipo === 'usuarios'
          ? `/api/admin/usuarios/${registro.id}`
          : tipo === 'locales'
            ? `/api/admin/locales/${registro.id}`
            : tipo === 'departamentos'
              ? `/api/admin/departamentos/${registro.id}`
              : `/api/admin/paises/${registro.id}`;

      await callAPI(endpoint, 'DELETE');
      setModalAbierta(false);
      refrescarDatos();
    } catch (err) {
      setError(
        tipo === 'departamentos' || CATALOGOS_TAREA[tipo]
          ? err.message
          : obtenerMensajeError(err, 'eliminar')
      );
    } finally {
      setCargandoFormulario(false);
    }
  };

  const handleGuardar = async () => {
    try {
      setCargandoFormulario(true);
      setError('');

      if (CATALOGOS_TAREA[tipoFormulario]) {
        const { endpoint } = CATALOGOS_TAREA[tipoFormulario];
        await callAPI(
          modoFormulario === 'crear' ? endpoint : `${endpoint}/${valores.id}`,
          modoFormulario === 'crear' ? 'POST' : 'PUT',
          { nombre: valores.nombre, color_hex: valores.color_hex || '#cccccc' }
        );
      } else if (tipoFormulario === 'paises') {
        if (modoFormulario === 'crear') {
          await callAPI('/api/admin/paises', 'POST', {
            nombre: valores.nombre,
          });
        } else {
          await callAPI(`/api/admin/paises/${valores.id}`, 'PUT', {
            nombre: valores.nombre,
          });
        }
      } else if (tipoFormulario === 'locales') {
        if (modoFormulario === 'crear') {
          await callAPI('/api/admin/locales', 'POST', {
            nombre: valores.nombre,
            pais_id: valores.pais_id,
          });
        } else {
          await callAPI(`/api/admin/locales/${valores.id}`, 'PUT', {
            nombre: valores.nombre,
            pais_id: valores.pais_id,
          });
        }
      } else if (tipoFormulario === 'departamentos') {
        await callAPI(
          modoFormulario === 'crear'
            ? '/api/admin/departamentos'
            : `/api/admin/departamentos/${valores.id}`,
          modoFormulario === 'crear' ? 'POST' : 'PUT',
          {
            nombre: valores.nombre,
            local_ids: valores.local_ids || [],
          }
        );
      } else if (tipoFormulario === 'usuarios') {
        if (modoFormulario === 'crear') {
          const dominio = process.env.NEXT_PUBLIC_APP_DOMAIN || '@omniflow.com';
          const email = `${valores.username}${dominio}`;

          await callAPI('/api/admin/usuarios', 'POST', {
            email,
            nombre_completo: valores.nombre_completo,
            local_id: valores.local_id,
            departamento_id: valores.departamento_id || null,
            rol_id: valores.rol_id,
            password: valores.password,
          });
        } else {
          await callAPI(`/api/admin/usuarios/${valores.id}`, 'PUT', {
            nombre_completo: valores.nombre_completo,
            local_id: valores.local_id,
            departamento_id: valores.departamento_id || null,
            rol_id: valores.rol_id,
            estado: valores.estado,
            password: valores.password || null,
          });
        }
      }

      setModalAbierta(false);
      refrescarDatos();
    } catch (err) {
      setError(
        tipoFormulario === 'departamentos' || CATALOGOS_TAREA[tipoFormulario]
          ? err.message
          : obtenerMensajeError(err, 'guardar')
      );
    } finally {
      setCargandoFormulario(false);
    }
  };

  if (cargandoAuth) {
    return <div>Cargando...</div>;
  }

  return (
    <Layout titulo="Gestión de Configuración" ocultarHeader>
      <section className={styles.hero}>
        <div>
          <p className={styles.heroKicker}>Configuracion administrativa</p>
          <h1 className={styles.heroTitulo}>Gestion de catalogos y usuarios</h1>
          <p className={styles.heroSubtitulo}>
            Administra la estructura base de la operacion para mantener
            usuarios, departamentos, locales y paises alineados con el flujo de
            trabajo.
          </p>
        </div>

        <div className={styles.heroHighlights}>
          <div className={styles.highlightBox}>
            <FiUsers />
            <div>
              <strong>{usuarios.length}</strong>
              <span>usuarios</span>
            </div>
          </div>
          <div className={styles.highlightBox}>
            <FiSettings />
            <div>
              <strong>{locales.length}</strong>
              <span>locales</span>
            </div>
          </div>
          <div className={styles.highlightBox}>
            <FiGlobe />
            <div>
              <strong>{paises.length}</strong>
              <span>paises</span>
            </div>
          </div>
        </div>
      </section>

      {error && <div className={styles.errorGlobal}>{error}</div>}

      <div className={styles.contenido}>
        {/* MAIN - Usuarios */}
        <div className={styles.main}>
          <div className={styles.encabezado}>
            <div>
              <p className={styles.eyebrow}>Directorio principal</p>
              <h3>Usuarios</h3>
            </div>
            <button
              onClick={() => handleNuevo('usuarios')}
              className={styles.btnNuevo}
            >
              <FiShield />
              Agregar usuario
            </button>
          </div>

          <TablaGenerica
            columnas={[
              { key: 'nombre_completo', label: 'Nombre' },
              {
                key: 'rol_id',
                label: 'Rol',
                render: (v) => {
                  const rol = roles.find((r) => r.id === v);
                  return (
                    rol?.nombre?.charAt(0).toUpperCase() +
                      rol?.nombre?.slice(1) || '-'
                  );
                },
              },
              {
                key: 'local_id',
                label: 'Local',
                render: (v) => {
                  const local = locales.find((p) => p.id === v);
                  return local?.nombre || '-';
                },
              },
              {
                key: 'departamento_id',
                label: 'Departamento',
                render: (_, usuario) => usuario.departamento?.nombre || '-',
              },
              { key: 'estado', label: 'Estado' },
            ]}
            datos={usuarios}
            acciones={[
              {
                label: '✏️',
                onClick: (registro) => handleEditar(registro, 'usuarios'),
                color: 'warning',
              },
              {
                label: '🗑️',
                onClick: (registro) => handleEliminar(registro, 'usuarios'),
                color: 'danger',
              },
            ]}
            cargando={cargando}
          />
        </div>

        {/* SIDEBAR */}
        <div className={styles.sidebar}>
          {/* Locales */}
          <div className={styles.seccion}>
            <h4 className={styles.seccionTitulo}>🏭 Locales</h4>
            <div className={styles.seccionContenido}>
              {locales.length === 0 ? (
                <p
                  style={{
                    color: '#999',
                    fontSize: '12px',
                    gridColumn: '1/-1',
                  }}
                >
                  No hay locales
                </p>
              ) : (
                locales.map((local) => (
                  <div
                    key={local.id}
                    className={styles.itemSidebar}
                    onClick={() => handleEditar(local, 'locales')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#1e293b',
                          fontSize: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {local.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#94a3b8',
                        }}
                      >
                        {local.pais?.nombre || '-'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              className={styles.btnAgregarSidebar}
              onClick={() => handleNuevo('locales')}
            >
              + Agregar Local
            </button>
          </div>

          {/* Países */}
          <div className={styles.seccion}>
            <h4 className={styles.seccionTitulo}>🌍 Países</h4>
            <div className={styles.seccionContenido}>
              {paises.length === 0 ? (
                <p
                  style={{
                    color: '#999',
                    fontSize: '12px',
                    gridColumn: '1/-1',
                  }}
                >
                  No hay países
                </p>
              ) : (
                paises.map((pais) => (
                  <div
                    key={pais.id}
                    className={styles.itemSidebar}
                    onClick={() => handleEditar(pais, 'paises')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#1e293b',
                          fontSize: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {pais.nombre}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              className={styles.btnAgregarSidebar}
              onClick={() => handleNuevo('paises')}
            >
              + Agregar País
            </button>
          </div>

          <div className={styles.seccion}>
            <h4 className={styles.seccionTitulo}>🏢 Departamentos</h4>
            <div className={styles.seccionContenido}>
              {departamentos.length === 0 ? (
                <p
                  style={{
                    color: '#999',
                    fontSize: '12px',
                    gridColumn: '1/-1',
                  }}
                >
                  No hay departamentos
                </p>
              ) : (
                departamentos.map((departamento) => {
                  const nombresLocales =
                    departamento.locales_departamentos
                      ?.map((relacion) => relacion.local?.nombre)
                      .filter(Boolean) || [];

                  return (
                    <div
                      key={departamento.id}
                      className={styles.itemSidebar}
                      onClick={() =>
                        handleEditar(departamento, 'departamentos')
                      }
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#1e293b',
                          fontSize: '12px',
                        }}
                      >
                        {departamento.nombre}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {nombresLocales.length
                          ? nombresLocales.join(', ')
                          : 'Sin locales asignados'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              className={styles.btnAgregarSidebar}
              onClick={() => handleNuevo('departamentos')}
            >
              + Agregar Departamento
            </button>
          </div>

          {/* Estados y Prioridades de tareas */}
          {[
            {
              tipo: 'estados',
              titulo: '🚦 Estados',
              lista: estados,
              vacio: 'No hay estados',
              boton: '+ Agregar Estado',
            },
            {
              tipo: 'prioridades',
              titulo: '🔥 Prioridades',
              lista: prioridades,
              vacio: 'No hay prioridades',
              boton: '+ Agregar Prioridad',
            },
          ].map(({ tipo, titulo, lista, vacio, boton }) => (
            <div key={tipo} className={styles.seccion}>
              <h4 className={styles.seccionTitulo}>{titulo}</h4>
              <div className={styles.seccionContenido}>
                {lista.length === 0 ? (
                  <p
                    style={{
                      color: '#999',
                      fontSize: '12px',
                      gridColumn: '1/-1',
                    }}
                  >
                    {vacio}
                  </p>
                ) : (
                  lista.map((item) => (
                    <div
                      key={item.id}
                      className={styles.itemSidebar}
                      onClick={() => handleEditar(item, tipo)}
                    >
                      <div className={styles.itemCatalogo}>
                        <span
                          className={styles.muestraColor}
                          style={{ backgroundColor: item.color_hex }}
                        />
                        <span>{formatearNombreCatalogo(item.nombre)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                className={styles.btnAgregarSidebar}
                onClick={() => handleNuevo(tipo)}
              >
                {boton}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal y Formulario */}
      <Modal
        abierto={modalAbierta}
        onCerrar={() => setModalAbierta(false)}
        titulo={`${modoFormulario === 'crear' ? 'Crear' : 'Editar'} ${
          TITULOS_TIPO[tipoFormulario] || 'Usuario'
        }`}
        onAceptar={handleGuardar}
        onEliminar={
          modoFormulario === 'editar' &&
          registroSeleccionado &&
          (tipoFormulario === 'paises' ||
            tipoFormulario === 'locales' ||
            tipoFormulario === 'departamentos' ||
            CATALOGOS_TAREA[tipoFormulario])
            ? () => handleEliminar(registroSeleccionado, tipoFormulario)
            : null
        }
        cargando={cargandoFormulario}
        modo={modoFormulario}
      >
        <FormularioMulti
          modo={modoFormulario}
          campos={
            CATALOGOS_TAREA[tipoFormulario]
              ? [
                  {
                    name: 'nombre',
                    label: `Nombre del ${CATALOGOS_TAREA[tipoFormulario].singular}`,
                    type: 'text',
                    required: true,
                    placeholder:
                      tipoFormulario === 'estados'
                        ? 'Ej: En espera'
                        : 'Ej: Crítica',
                    ayuda:
                      'Se guarda en minúsculas con guiones bajos. Los registros del sistema solo permiten cambiar el color.',
                  },
                  {
                    name: 'color_hex',
                    label: 'Color de la viñeta',
                    type: 'color',
                    required: true,
                  },
                ]
              : tipoFormulario === 'departamentos'
                ? [
                    {
                      name: 'nombre',
                      label: 'Nombre del departamento',
                      type: 'text',
                      required: true,
                      placeholder: 'Ej: Recursos Humanos',
                    },
                    {
                      name: 'local_ids',
                      label: 'Locales donde existe',
                      type: 'checkbox-group',
                      required: true,
                      options: locales.map((local) => ({
                        id: local.id,
                        label: `${local.nombre} (${local.pais?.nombre || 'Sin país'})`,
                      })),
                      ayuda:
                        'Puedes vincular el mismo departamento con varios locales.',
                    },
                  ]
                : tipoFormulario === 'paises'
                  ? [
                      {
                        name: 'nombre',
                        label: 'Nombre del País',
                        type: 'text',
                        required: true,
                        placeholder: 'Ej: Colombia',
                      },
                    ]
                  : tipoFormulario === 'locales'
                    ? [
                        {
                          name: 'nombre',
                          label: 'Nombre del local',
                          type: 'text',
                          required: true,
                          placeholder: 'Ej: Local Bogotá',
                        },
                        {
                          name: 'pais_id',
                          label: 'País',
                          type: 'select',
                          required: true,
                          options: paises.map((p) => ({
                            id: p.id,
                            label: p.nombre,
                          })),
                        },
                      ]
                    : [
                        {
                          name: 'nombre_completo',
                          label: 'Nombre Completo',
                          type: 'text',
                          required: true,
                          placeholder: 'Ej: Juan Pérez',
                          disabled: modoFormulario === 'editar',
                        },
                        {
                          name: 'username',
                          label: 'Usuario',
                          type: 'text',
                          required: modoFormulario === 'crear',
                          placeholder: 'Ej: juan.perez',
                          disabled: modoFormulario === 'editar',
                          ayuda:
                            'Se usará para crear el correo de acceso del usuario.',
                          mostrarEn: ['crear'],
                        },
                        {
                          name: 'password',
                          label: 'Contraseña',
                          type: 'password',
                          required: modoFormulario === 'crear',
                          placeholder:
                            modoFormulario === 'crear'
                              ? 'Ej: MinaT@123'
                              : '(Dejar vacío para no cambiar)',
                          ayuda:
                            modoFormulario === 'crear'
                              ? 'Contraseña inicial'
                              : 'Dejar vacío para mantener la actual',
                        },
                        {
                          name: 'rol_id',
                          label: 'Rol',
                          type: 'select',
                          required: true,
                          options: roles.map((r) => ({
                            id: r.id,
                            label:
                              r.nombre.charAt(0).toUpperCase() +
                              r.nombre.slice(1),
                          })),
                        },
                        {
                          name: 'local_id',
                          label: 'Local Asignado',
                          type: 'select',
                          required: true,
                          options: locales.map((p) => ({
                            id: p.id,
                            label: p.nombre,
                          })),
                        },
                        {
                          name: 'departamento_id',
                          label: 'Departamento',
                          type: 'select',
                          options: departamentos
                            .filter((departamento) =>
                              departamento.locales_departamentos?.some(
                                (relacion) =>
                                  relacion.local_id === valores.local_id
                              )
                            )
                            .map((departamento) => ({
                              id: departamento.id,
                              label: departamento.nombre,
                            })),
                          ayuda:
                            'Opcional. Solo aparecen departamentos vinculados al local seleccionado.',
                        },
                        {
                          name: 'estado',
                          label: 'Estado',
                          type: 'select',
                          options: [
                            { id: 'activo', label: 'Activo' },
                            { id: 'inactivo', label: 'Inactivo' },
                          ],
                          mostrarEn: ['editar'],
                        },
                      ]
          }
          valores={valores}
          onCambio={handleCambioFormulario}
          cargando={cargandoFormulario}
          error={error}
        />
      </Modal>
    </Layout>
  );
}
