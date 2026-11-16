import { supabaseAdmin } from './supabaseAdmin';

async function verificarTokenBearer(bearerToken) {
  if (!bearerToken?.startsWith('Bearer ')) {
    return { isValid: false, reason: 'No Bearer token' };
  }

  const token = bearerToken.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user?.id) {
    return { isValid: false, reason: error?.message || 'Invalid token' };
  }

  return { isValid: true, user: data.user };
}

/**
 * Verificar y validar token JWT Bearer
 * Devuelve { isValid, reason } o { isValid, userEmail }
 */
export async function verifyAdminToken(bearerToken) {
  try {
    const autenticacion = await verificarTokenBearer(bearerToken);
    if (!autenticacion.isValid) return autenticacion;

    // Verificar que el usuario sea ADMIN - con JOIN a tabla roles
    const { data: userData, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, rol:roles(nombre)')
      .eq('id', autenticacion.user.id)
      .single();

    if (error || !userData) return { isValid: false, reason: 'User not found' };

    // Verificar que el rol sea 'admin'
    const rolNombre = userData.rol?.nombre;
    if (rolNombre !== 'admin') return { isValid: false, reason: 'Not admin' };

    return { isValid: true, userEmail: userData.email };
  } catch (err) {
    return { isValid: false, reason: err.message };
  }
}

/**
 * Verificar y validar token JWT Bearer para Admin O Supervisor
 * Devuelve { isValid, reason } o { isValid, rol, userId, local_id }
 */
export async function verifyAdminOrSupervisorToken(bearerToken) {
  try {
    const autenticacion = await verificarTokenBearer(bearerToken);
    if (!autenticacion.isValid) return autenticacion;

    // Obtener usuario con rol
    const { data: userData, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, local_id, rol:roles(nombre)')
      .eq('id', autenticacion.user.id)
      .single();

    if (error || !userData) return { isValid: false, reason: 'User not found' };

    // Verificar que sea admin o supervisor
    const rolNombre = userData.rol?.nombre;
    if (rolNombre !== 'admin' && rolNombre !== 'supervisor') {
      return { isValid: false, reason: 'Not admin or supervisor' };
    }

    return {
      isValid: true,
      rol: rolNombre,
      userId: userData.id,
      userEmail: userData.email,
      local_id: userData.local_id,
    };
  } catch (err) {
    return { isValid: false, reason: err.message };
  }
}

/**
 * Verificar y validar token JWT Bearer para cualquier usuario autenticado
 * Devuelve { isValid, reason } o { isValid, userId, rol, email }
 */
export async function verifyUserToken(bearerToken) {
  try {
    const autenticacion = await verificarTokenBearer(bearerToken);
    if (!autenticacion.isValid) return autenticacion;

    // Obtener usuario con rol
    const { data: userData, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, rol:roles(nombre)')
      .eq('id', autenticacion.user.id)
      .single();

    if (error || !userData) return { isValid: false, reason: 'User not found' };

    return {
      isValid: true,
      userId: userData.id,
      rol: userData.rol?.nombre,
      email: userData.email,
    };
  } catch (err) {
    return { isValid: false, reason: err.message };
  }
}
