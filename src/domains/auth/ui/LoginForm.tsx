'use client';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useLoginMutation } from '@/domains/auth/model/hooks/use-login-mutation';
import type { LoginFormValues } from '@/domains/auth/model/types/login-form.types';
import type { AuthUser } from '@/domains/auth/model/types/auth.types';
import { createLoginSchema } from '@/domains/auth/model/validation/login-schema';
import { getAuthFormErrorMessage } from '@/domains/auth/lib/auth-form-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

// ========== Constants ==========
const initialValues: LoginFormValues = {
  email: '',
  password: '',
};

// ========== Types ==========

type LoginFormProps = {
  redirectPath?: string;
};

function getRoleDefaultRedirect(user: AuthUser): string {
  return user.roleName === 'admin' ? '/admin' : '/catalog';
}

// ========== Component ==========

export function LoginForm({ redirectPath }: LoginFormProps) {
  // ========== Hooks ==========

  const router = useRouter();
  const t = useTranslations('auth.login');
  const errorT = useTranslations('auth.errors');
  const validationT = useTranslations('auth.validation');
  const loginMutation = useLoginMutation();

  // ========== Derived Data ==========

  const validationSchema = createLoginSchema({
    emailInvalid: validationT('emailInvalid'),
    emailRequired: validationT('emailRequired'),
    passwordRequired: validationT('passwordRequired'),
  });

  // ========== Render ==========

  return (
    <>
      <Formik<LoginFormValues>
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => {
          loginMutation.mutate(values, {
            onSuccess(response) {
              router.replace(redirectPath ?? getRoleDefaultRedirect(response.data.user));
            },
          });
        }}
      >
        <Form className="mt-5 grid gap-4">
          {loginMutation.error ? (
            <p className="rounded-md border border-danger/40 bg-surface-raised px-3 py-2 text-caption text-danger">
              {getAuthFormErrorMessage(loginMutation.error, errorT)}
            </p>
          ) : null}

          <label className="grid gap-1 text-body font-medium">
            {t('fields.email.label')}
            <Field
              as={Input}
              type="email"
              autoComplete="email"
              name="email"
              placeholder={t('fields.email.placeholder')}
            />
            <ErrorMessage className="text-caption text-danger" component="span" name="email" />
          </label>

          <label className="grid gap-1 text-body font-medium">
            {t('fields.password.label')}
            <Field
              as={Input}
              type="password"
              autoComplete="current-password"
              name="password"
              placeholder={t('fields.password.placeholder')}
            />
            <ErrorMessage className="text-caption text-danger" component="span" name="password" />
          </label>

          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? t('submitLoading') : t('submit')}
          </Button>
        </Form>
      </Formik>

      <p className="mt-4 text-body text-muted">
        {t('registerPrompt')}{' '}
        <Link className="font-medium text-accent hover:text-accent-hover" href="/auth/register">
          {t('registerLink')}
        </Link>
      </p>
    </>
  );
}
