import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fafloriesbackend-5.onrender.com/api/v1';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export async function verifyAuth(request: Request): Promise<{
  user?: AuthUser;
  error?: string;
  status?: number;
}> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized - Authentication required', status: 401 };
  }

  try {
    const response = await axios.get<any>(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: authHeader,
      },
      timeout: 10000,
    });

    const body = response.data;
    const user = body?.data ?? body;

    if (!user) {
      return { error: 'Unauthorized - Invalid token structure', status: 401 };
    }

    const role = (user.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'super-admin' && role !== 'super_admin') {
      return { error: 'Forbidden - Admin role required', status: 403 };
    }

    return {
      user: {
        id: user.id || user._id || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || '',
      },
    };
  } catch (error: any) {
    console.error('[verifyAuth] Auth check failed:', error.message);
    const status = error.response?.status || 401;
    const message =
      error.response?.data?.message || 'Unauthorized - Invalid or missing token';
    return { error: message, status };
  }
}
