import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiLogOut, FiChevronRight } from 'react-icons/fi';
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
    <aside className={styles.sidebar}>
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
      </div>

      <nav className={styles.nav}>
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
            onClick={onLogout}
            className={styles.btnLogout}
            title="Cerrar sesion"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </aside>
  );
}
