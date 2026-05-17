import { LoginPage } from '@/page-components/auth/login-page';

// ===================== TYPES =====================

type LoginRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// ===================== HELPERS =====================

function readSingleParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return null;
}

function isSafeRedirectPath(value: string | null): value is string {
  if (!value) {
    return false;
  }

  if (!value.startsWith('/')) {
    return false;
  }

  return !value.startsWith('//');
}

// ===================== COMPONENT =====================

export default async function LoginRoute({ searchParams }: LoginRouteProps) {
  const params = await searchParams;
  const redirectPath = ['redirect', 'next', 'returnTo']
    .map(key => readSingleParam(params[key]))
    .find(isSafeRedirectPath);

  return <LoginPage redirectPath={redirectPath} />;
}
