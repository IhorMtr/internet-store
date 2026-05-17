'use client';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useRegisterMutation } from '@/domains/auth/model/hooks/use-register-mutation';
import type { RegisterFormValues } from '@/domains/auth/model/types/register-form.types';
import { createRegisterSchema } from '@/domains/auth/model/validation/register-schema';
import { getAuthFormErrorMessage } from '@/domains/auth/lib/auth-form-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

// ========== Constants ==========
const initialValues: RegisterFormValues = {
  email: '',
  fullName: '',
  password: '',
};

// ========== Component ==========

export function RegisterForm() {
  // ========== Hooks ==========

  const router = useRouter();
  const t = useTranslations('auth.register');
  const errorT = useTranslations('auth.errors');
  const validationT = useTranslations('auth.validation');
  const registerMutation = useRegisterMutation();

  // ========== Derived Data ==========

  const validationSchema = createRegisterSchema({
    emailInvalid: validationT('emailInvalid'),
    emailRequired: validationT('emailRequired'),
    passwordMinLength: validationT('passwordMinLength'),
    passwordRequired: validationT('passwordRequired'),
  });

  // ========== Render ==========

  return (
    <>
      <Formik<RegisterFormValues>
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => {
          registerMutation.mutate(
            {
              email: values.email,
              password: values.password,
              fullName: values.fullName.trim() || null,
            },
            {
              onSuccess(response) {
                if (response.data.accessToken) {
                  router.replace('/home');
                  return;
                }

                router.replace('/auth/login');
              },
            }
          );
        }}
      >
        <Form className="mt-5 grid gap-4">
          {registerMutation.error ? (
            <p className="rounded-md border border-danger/40 bg-surface-raised px-3 py-2 text-caption text-danger">
              {getAuthFormErrorMessage(registerMutation.error, errorT)}
            </p>
          ) : null}

          <label className="grid gap-1 text-body font-medium">
            {t('fields.fullName.label')}
            <Field
              as={Input}
              type="text"
              autoComplete="name"
              name="fullName"
              placeholder={t('fields.fullName.placeholder')}
            />
            <ErrorMessage className="text-caption text-danger" component="span" name="fullName" />
          </label>

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
              autoComplete="new-password"
              name="password"
              placeholder={t('fields.password.placeholder')}
            />
            <ErrorMessage className="text-caption text-danger" component="span" name="password" />
          </label>

          <Button type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? t('submitLoading') : t('submit')}
          </Button>
        </Form>
      </Formik>

      <p className="mt-4 text-body text-muted">
        {t('loginPrompt')}{' '}
        <Link className="font-medium text-accent hover:text-accent-hover" href="/auth/login">
          {t('loginLink')}
        </Link>
      </p>
    </>
  );
}
