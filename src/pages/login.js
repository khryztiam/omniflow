import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@context/AuthContext';
import styles from '@styles/Login.module.css';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import OmniFlowMark from '@components/OmniFlowMark';
import packageInfo from '../../package.json';

const DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || '@omniflow.com';
const APP_VERSION = `v${packageInfo.version}`;

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const { login, usuarioDetalles, cargando: cargandoAuth } = useAuth();

  useEffect(() => {
    if (usuarioDetalles && !cargandoAuth) {
      const rol = usuarioDetalles?.rol?.nombre;
      if (rol === 'admin') {
        router.push('/admin/dashboard');
      } else if (rol === 'supervisor') {
        router.push('/supervisor/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }
  }, [usuarioDetalles, cargandoAuth, router]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const email = username + DOMAIN;
      await login(email, pass);
    } catch (err) {
      setError(err.message || 'Usuario o contrasena incorrectos');
      setCargando(false);
    }
  };

  return (
    <div className={styles.contenedor}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoBadge}>
            <OmniFlowMark className={styles.logoSvg} />
          </div>
          <h1 className={styles.nombre}>
            <span className={styles.nombreOmni}>Omni</span>
            <span className={styles.nombreFlow}>Flow</span>
          </h1>
          <p className={styles.subtitulo}>Inicia sesion para continuar</p>
        </div>

        <form onSubmit={manejarEnvio} className={styles.formulario}>
          <div className={styles.grupo}>
            <div className={styles.inputConIcono}>
              <FiUser className={styles.icono} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                className={styles.entrada}
                required
                disabled={cargando}
              />
              <span className={styles.dominio}>{DOMAIN}</span>
            </div>
          </div>

          <div className={styles.grupo}>
            <div
              className={`${styles.inputConIcono} ${styles.campoContrasena}`}
            >
              <FiLock className={styles.icono} />
              <input
                id="login-contrasena"
                type={mostrarContrasena ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Contraseña"
                className={styles.entrada}
                autoComplete="current-password"
                aria-label="Contraseña"
                required
                disabled={cargando}
              />
              <button
                type="button"
                className={styles.botonContrasena}
                aria-label={
                  mostrarContrasena
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
                aria-controls="login-contrasena"
                aria-pressed={mostrarContrasena}
                onClick={() => setMostrarContrasena((visible) => !visible)}
                disabled={cargando}
              >
                {mostrarContrasena ? (
                  <FiEyeOff aria-hidden="true" />
                ) : (
                  <FiEye aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={`${styles.mensaje} ${styles.error}`}>{error}</div>
          )}

          <button type="submit" className={styles.boton} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>OmniFlow {APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
