/**
 * Script para crear usuarios de prueba en Supabase
 * Ejecutar: node scripts/crearUsuariosPrueba.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || '@omniflow.com';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno requeridas:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📋 Configura estas variables en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function crearUsuariosPrueba() {
  try {
    console.log('🔄 Creando usuarios de prueba...\n');

    // Obtener locales
    const { data: locales, error: errLocales } = await supabase
      .from('locales')
      .select('id, nombre')
      .limit(3);

    if (errLocales) throw errLocales;
    if (!locales?.length) {
      throw new Error(
        'No hay locales disponibles. Crea al menos un local antes de sembrar usuarios de prueba.'
      );
    }

    // Obtener roles
    const { data: roles, error: errRoles } = await supabase
      .from('roles')
      .select('id, nombre');

    if (errRoles) throw errRoles;
    const rolesRequeridos = ['admin', 'supervisor', 'user'];
    const rolesDisponibles = new Set(roles.map((rol) => rol.nombre));
    const rolesFaltantes = rolesRequeridos.filter(
      (rol) => !rolesDisponibles.has(rol)
    );
    if (rolesFaltantes.length) {
      throw new Error(
        `Faltan roles requeridos: ${rolesFaltantes.join(', ')}.`
      );
    }

    // Datos de usuarios a crear (las contraseñas se pasan como env vars)
    const defaultPass = process.env.DEFAULT_TEST_PASSWORD;
    if (!defaultPass) {
      console.error('❌ Error: DEFAULT_TEST_PASSWORD no configurada');
      console.log(
        'ℹ️  Usa: DEFAULT_TEST_PASSWORD=TuPassword123 node scripts/crearUsuariosPrueba.js'
      );
      process.exit(1);
    }

    const usuariosPrueba = [
      {
        email: `admin-prueba${appDomain}`,
        nombre: 'Administrador General',
        rol: 'admin',
        local: locales[0]?.id,
        password: defaultPass,
      },
      {
        email: `supervisor${appDomain}`,
        nombre: 'Supervisor Principal',
        rol: 'supervisor',
        local: locales[0]?.id,
        password: defaultPass,
      },
      {
        email: `usuario1${appDomain}`,
        nombre: 'Usuario Uno',
        rol: 'user',
        local: locales[0]?.id,
        password: defaultPass,
      },
      {
        email: `usuario2${appDomain}`,
        nombre: 'Usuario Dos',
        rol: 'user',
        local: locales[1]?.id || locales[0]?.id,
        password: defaultPass,
      },
    ];

    let supervisorId = null;

    for (const usuario of usuariosPrueba) {
      if (usuario.rol === 'user' && !supervisorId) {
        console.error(
          '  ❌ No se encontró el supervisor de prueba; no se puede asociar el usuario.'
        );
        continue;
      }

      const rolObj = roles.find((r) => r.nombre === usuario.rol);
      if (!rolObj) {
        console.error(`  ❌ Rol ${usuario.rol} no encontrado`);
        continue;
      }

      console.log(`➕ Creando ${usuario.email}...`);

      // Crear en auth
      const { data: authData, error: authErr } =
        await supabase.auth.admin.createUser({
          email: usuario.email,
          password: usuario.password,
          email_confirm: true,
        });

      if (authErr) {
        console.error(`  ❌ Error en Auth: ${authErr.message}`);
        continue;
      }

      // Crear en tabla usuarios
      const { error: dbErr } = await supabase.from('usuarios').insert([
        {
          id: authData.user.id,
          email: usuario.email,
          nombre_completo: usuario.nombre,
          local_id: usuario.local,
          rol_id: rolObj.id,
          supervisor_id: usuario.rol === 'user' ? supervisorId : null,
          estado: 'activo',
        },
      ]);

      if (dbErr) {
        console.error(`  ❌ Error en BD: ${dbErr.message}`);
        continue;
      }

      if (usuario.rol === 'supervisor') {
        supervisorId = authData.user.id;
      }

      console.log(`  ✅ ${usuario.email} creado correctamente`);
    }

    console.log('\n✅ ¡Usuarios de prueba creados!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

crearUsuariosPrueba();
