import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

import { supabaseAdmin } from '../src/lib/supabaseAdmin';
import {
  verifyAdminOrSupervisorToken,
  verifyAdminToken,
  verifyUserToken,
} from '../src/lib/auth';

const crearConsultaUsuario = (data, error = null) => {
  const consulta = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  consulta.select.mockReturnValue(consulta);
  consulta.eq.mockReturnValue(consulta);
  supabaseAdmin.from.mockReturnValue(consulta);
  return consulta;
};

describe('validación de tokens de API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['admin', verifyAdminToken],
    ['admin o supervisor', verifyAdminOrSupervisorToken],
    ['usuario', verifyUserToken],
  ])(
    'rechaza tokens no verificados para %s antes de consultar el perfil',
    async (_rol, verificar) => {
      supabaseAdmin.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' },
      });

      const resultado = await verificar('Bearer token.falsificado');

      expect(resultado).toEqual({ isValid: false, reason: 'Invalid JWT' });
      expect(supabaseAdmin.auth.getUser).toHaveBeenCalledWith(
        'token.falsificado'
      );
      expect(supabaseAdmin.from).not.toHaveBeenCalled();
    }
  );

  it('valida la identidad antes de comprobar el rol de admin', async () => {
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-user-id' } },
      error: null,
    });
    const consulta = crearConsultaUsuario({
      id: 'auth-user-id',
      email: 'admin@example.com',
      rol: { nombre: 'admin' },
    });

    const resultado = await verifyAdminToken('Bearer token-valido');

    expect(consulta.eq).toHaveBeenCalledWith('id', 'auth-user-id');
    expect(resultado).toEqual({
      isValid: true,
      userEmail: 'admin@example.com',
    });
  });

  it('mantiene los datos de rol y local para admin o supervisor verificados', async () => {
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: { id: 'supervisor-id' } },
      error: null,
    });
    const consulta = crearConsultaUsuario({
      id: 'supervisor-id',
      email: 'supervisor@example.com',
      local_id: 'local-id',
      rol: { nombre: 'supervisor' },
    });

    const resultado = await verifyAdminOrSupervisorToken('Bearer valido');

    expect(consulta.eq).toHaveBeenCalledWith('id', 'supervisor-id');
    expect(resultado).toEqual({
      isValid: true,
      rol: 'supervisor',
      userId: 'supervisor-id',
      userEmail: 'supervisor@example.com',
      local_id: 'local-id',
    });
  });

  it('valida y conserva los datos del usuario autenticado', async () => {
    supabaseAdmin.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-id' } },
      error: null,
    });
    const consulta = crearConsultaUsuario({
      id: 'user-id',
      email: 'user@example.com',
      rol: { nombre: 'user' },
    });

    const resultado = await verifyUserToken('Bearer valido');

    expect(consulta.eq).toHaveBeenCalledWith('id', 'user-id');
    expect(resultado).toEqual({
      isValid: true,
      userId: 'user-id',
      rol: 'user',
      email: 'user@example.com',
    });
  });
});
