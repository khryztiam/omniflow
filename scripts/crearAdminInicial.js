const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || '@omniflow.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_INITIAL_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno requeridas:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📋 Configura estas variables en .env.local');
  process.exit(1);
}

if (!ADMIN_INITIAL_PASSWORD) {
  console.error('❌ Falta la variable de entorno ADMIN_INITIAL_PASSWORD.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function crearAdminInicial() {
  try {
    const username = ADMIN_USERNAME;
    const email = `${username}${APP_DOMAIN}`;

    console.log(`🚀 Configurando usuario admin: ${email}`);

    // 1. Intentar obtener el usuario existente o crear uno nuevo
    let userId;
    const { data: existente } = await supabase.auth.admin.listUsers();
    const usuarioExistente = existente?.users?.find((u) => u.email === email);

    if (usuarioExistente) {
      userId = usuarioExistente.id;
      console.log(`✅ Usuario encontrado en auth: ${userId}`);
    } else {
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: email,
          password: ADMIN_INITIAL_PASSWORD,
          email_confirm: true,
        });

      if (authError) {
        throw new Error(`Error en auth: ${authError.message}`);
      }

      userId = authData.user.id;
      console.log(`✅ Usuario creado en auth: ${userId}`);
    }

    // 2. Obtener el ID del rol admin
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre', 'admin')
      .single();

    if (rolesError) {
      throw new Error(`Error obteniendo rol admin: ${rolesError.message}`);
    }

    const rolAdminId = roles.id;
    console.log(`✅ Rol admin encontrado: ${rolAdminId}`);

    // 3. Obtener el primer local para asignar (o usar NULL)
    const { data: locales, error: localesError } = await supabase
      .from('locales')
      .select('id')
      .limit(1)
      .single();

    let localId = null;
    if (!localesError && locales) {
      localId = locales.id;
      console.log(`✅ Local asignado: ${localId}`);
    } else {
      console.log(`⚠️  No hay locales disponibles, asignando NULL`);
    }

    // 4. Insertar o actualizar en tabla usuarios
    const { data: usuarioExisteEnBD } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', userId)
      .single();

    if (usuarioExisteEnBD) {
      console.log(`✅ Usuario ya existe en BD, actualizando...`);
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          email: email,
          nombre_completo: 'Admin OmniFlow',
          local_id: localId,
          rol_id: rolAdminId,
          estado: 'activo',
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Error actualizando usuario: ${updateError.message}`);
      }
    } else {
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: userId,
            email: email,
            nombre_completo: 'Admin OmniFlow',
            local_id: localId,
            rol_id: rolAdminId,
            estado: 'activo',
          },
        ])
        .select();

      if (usuarioError) {
        throw new Error(
          `Error creando registro usuario: ${usuarioError.message}`
        );
      }
    }

    console.log(`✅ Usuario admin creado exitosamente!`);
    console.log(`\n📋 Credenciales de acceso:`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin`);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  }
}

crearAdminInicial();
