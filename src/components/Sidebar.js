import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiLogOut, FiChevronRight, FiMenu, FiX } from 'react-icons/fi';
import {
  FiGrid,
  FiSettings,
  FiCheckSquare,
  FiShare2,
  FiPieChart,
  FiUsers,
} from 'react-icons/fi';
import OmniFlowMark from './OmniFlowMark';
import styles from '@styles/Layout.module.css';
import { obtenerTextoRol } from '@utils/formateo';

export default function Sidebar({ usuarioDetalles, onLogout }) {
  const router = useRouter();
  const rol = usuarioDetalles?.rol?.nombre;
  const [menuAbierto, setMenuAbierto] = useState(false);
  const botonMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  const menuId = useId();

  const cerrarMenu = () => {
    if (menuAbierto) {
      setMenuAbierto(false);
      botonMenuRef.current?.focus();
    }
  };

  useEffect(() => {
    const cerrarAlNavegar = () => setMenuAbierto(false);
    router.events.on('routeChangeStart', cerrarAlNavegar);
    return () => router.events.off('routeChangeStart', cerrarAlNavegar);
  }, [router.events]);

  useEffect(() => {
    const pantallaMovil = window.matchMedia('(max-width: 768px)');
    const cerrarEnEscritorio = () => {
      if (!pantallaMovil.matches) setMenuAbierto(false);
    };
    pantallaMovil.addEventListener('change', cerrarEnEscritorio);
    return () =>
      pantallaMovil.removeEventListener('change', cerrarEnEscritorio);
  }, []);

  useEffect(() => {
    if (!menuAbierto) return;

    const cerrarConEscape = (evento) => {
      if (evento.key === 'Escape') {
        setMenuAbierto(false);
        botonMenuRef.current?.focus();
      }
    };
    const cerrarAlPulsarFuera = (evento) => {
      if (!sidebarRef.current?.contains(evento.target)) setMenuAbierto(false);
    };
    document.addEventListener('keydown', cerrarConEscape);
    document.addEventListener('pointerdown', cerrarAlPulsarFuera);
    return () => {
      document.removeEventListener('keydown', cerrarConEscape);
      document.removeEventListener('pointerdown', cerrarAlPulsarFuera);
    };
  }, [menuAbierto]);

  const obtenerClaseAcento = (ruta) => {
    if (ruta.includes('/dashboard')) return styles.accentSky;
    if (ruta.includes('/estadisticas')) return styles.accentTeal;
    if (ruta.includes('/gestion')) return styles.accentAmber;
    if (ruta.includes('/tareas')) return styles.accentBlue;
    if (ruta.includes('/asignaciones')) return styles.accentViolet;
    return '';
  };

  const getMenuPorRol = () => {
    switch (rol) {
      case 'admin':
        return {
          secciones: [
            {
              titulo: 'ADMINISTRACION',
              items: [
                {
                  label: 'Dashboard Global',
                  ruta: '/admin/dashboard',
                  icono: FiGrid,
                },
                {
                  label: 'Estadisticas',
                  ruta: '/admin/estadisticas',
                  icono: FiPieChart,
                },
                {
                  label: 'Gestion',
                  ruta: '/admin/gestion',
                  icono: FiSettings,
                },
              ],
            },
            {
              titulo: 'OPERACIONES',
              items: [
                {
                  label: 'Todas las Tareas',
                  ruta: '/admin/tareas',
                  icono: FiCheckSquare,
                },
                {
                  label: 'Asignaciones',
                  ruta: '/admin/asignaciones',
                  icono: FiShare2,
                },
              ],
            },
          ],
        };

      case 'supervisor':
        return {
          secciones: [
            {
              titulo: 'ADMINISTRACION',
              items: [
                {
                  label: 'Dashboard',
                  ruta: '/supervisor/dashboard',
                  icono: FiGrid,
                },
                {
                  label: 'Gestion',
                  ruta: '/supervisor/gestion',
                  icono: FiUsers,
                },
              ],
            },
            {
              titulo: 'OPERACIONES',
              items: [
                {
                  label: 'Mis Tareas',
                  ruta: '/supervisor/tareas',
                  icono: FiCheckSquare,
                },
                {
                  label: 'Todas las tareas',
                  ruta: '/supervisor/asignaciones',
                  icono: FiShare2,
                },
              ],
            },
          ],
        };

      case 'user':
      default:
        return {
          secciones: [
            {
              titulo: 'MIS ACTIVIDADES',
              items: [
                {
                  label: 'Dashboard',
                  ruta: '/user/dashboard',
                  icono: FiGrid,
                },
                {
                  label: 'Mis Tareas',
                  ruta: '/user/tareas',
                  icono: FiCheckSquare,
                },
              ],
            },
          ],
        };
    }
  };

  const menu = getMenuPorRol();
  const isActivo = (ruta) => router.pathname === ruta;

  return (
    <aside
      ref={sidebarRef}
      className={styles.sidebar}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) {
          setMenuAbierto(false);
        }
      }}
    >
      <div className={styles.logoArea}>
        <div className={styles.brandRow}>
          <div className={styles.logo}>
            <OmniFlowMark className={styles.logoSvg} />
          </div>
          <h1 className={styles.appNombre}>
            <span className={styles.brandOmni}>Omni</span>
            <span className={styles.brandFlow}>Flow</span>
          </h1>
        </div>
        <button
          ref={botonMenuRef}
          type="button"
          className={styles.botonMenu}
          aria-expanded={menuAbierto}
          aria-controls={menuId}
          aria-label={
            menuAbierto
              ? 'Cerrar menú de navegación'
              : 'Abrir menú de navegación'
          }
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          {menuAbierto ? (
            <FiX aria-hidden="true" />
          ) : (
            <FiMenu aria-hidden="true" />
          )}
          <span>{menuAbierto ? 'Cerrar' : 'Menú'}</span>
        </button>
      </div>

      <div
        id={menuId}
        className={`${styles.panelMenu} ${menuAbierto ? styles.menuAbierto : ''}`}
      >
        <nav className={styles.nav} aria-label="Navegación principal">
          {menu.secciones.map((seccion, idx) => (
            <div key={idx} className={styles.seccion}>
              <div className={styles.seccionTitulo}>{seccion.titulo}</div>
              {seccion.items.map((item) => {
                const IconComponent = item.icono;
                return (
                  <Link key={item.ruta} href={item.ruta} legacyBehavior>
                    <a
                      className={`${styles.navItem} ${obtenerClaseAcento(
                        item.ruta
                      )} ${isActivo(item.ruta) ? styles.activo : ''}`}
                      aria-current={isActivo(item.ruta) ? 'page' : undefined}
                      onClick={cerrarMenu}
                    >
                      <IconComponent className={styles.icono} />
                      <span className={styles.label}>{item.label}</span>
                      <FiChevronRight className={styles.indicador} />
                    </a>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.usuarioArea}>
            <div className={styles.avatar}>
              {usuarioDetalles?.nombre_completo?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.usuarioInfo}>
              <p className={styles.usuarioNombre}>
                {usuarioDetalles?.nombre_completo}
              </p>
              <span className={styles.rolBadge}>{obtenerTextoRol(rol)}</span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className={styles.btnLogout}
              title="Cerrar sesion"
              aria-label="Cerrar sesión"
            >
              <FiLogOut aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
