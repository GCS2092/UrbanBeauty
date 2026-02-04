type SupabaseAdminUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
};

const getEnv = (key: string, fallback?: string) =>
  process.env[key] || fallback;

const getSupabaseUrl = () =>
  getEnv('SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);

const getAnonKey = () =>
  getEnv('SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const getServiceRoleKey = () => getEnv('SUPABASE_SERVICE_ROLE_KEY');

const buildHeaders = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
});

async function requestJson<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.msg || data?.message || res.statusText;
    throw new Error(message);
  }
  return data as T;
}

export async function supabaseSignUp(email: string, password: string, data?: Record<string, any>) {
  const url = `${getSupabaseUrl()}/auth/v1/signup`;
  const key = getAnonKey() || getServiceRoleKey();
  if (!key) {
    throw new Error('SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is missing');
  }
  return requestJson<any>(url, {
    method: 'POST',
    headers: buildHeaders(key),
    body: JSON.stringify({ email, password, data }),
  });
}

export async function supabaseSignIn(email: string, password: string) {
  const url = `${getSupabaseUrl()}/auth/v1/token?grant_type=password`;
  const key = getAnonKey() || getServiceRoleKey();
  if (!key) {
    throw new Error('SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is missing');
  }
  return requestJson<any>(url, {
    method: 'POST',
    headers: buildHeaders(key),
    body: JSON.stringify({ email, password }),
  });
}

export async function supabaseAdminGetUser(userId: string): Promise<SupabaseAdminUser> {
  const url = `${getSupabaseUrl()}/auth/v1/admin/users/${userId}`;
  const key = getServiceRoleKey();
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
  }
  return requestJson<SupabaseAdminUser>(url, {
    method: 'GET',
    headers: buildHeaders(key),
  });
}

export async function supabaseAdminListUsers(page = 1, perPage = 50) {
  const url = `${getSupabaseUrl()}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
  const key = getServiceRoleKey();
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
  }
  return requestJson<any>(url, {
    method: 'GET',
    headers: buildHeaders(key),
  });
}

export async function supabaseAdminUpdateUser(userId: string, data: Record<string, any>) {
  const url = `${getSupabaseUrl()}/auth/v1/admin/users/${userId}`;
  const key = getServiceRoleKey();
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
  }
  return requestJson<any>(url, {
    method: 'PUT',
    headers: buildHeaders(key),
    body: JSON.stringify(data),
  });
}

export async function supabaseAdminDeleteUser(userId: string) {
  const url = `${getSupabaseUrl()}/auth/v1/admin/users/${userId}`;
  const key = getServiceRoleKey();
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
  }
  return requestJson<any>(url, {
    method: 'DELETE',
    headers: buildHeaders(key),
  });
}

export function getSupabaseRoleFromUser(user?: SupabaseAdminUser) {
  return (
    user?.user_metadata?.role ||
    user?.app_metadata?.role ||
    'CLIENT'
  );
}
