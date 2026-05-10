import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { ApiQueryProvider } from '@/shared/providers/api-query-provider';
import { ToastProvider } from '@/shared/providers/toast-provider';
import '../globals.css';

// ===================== CONSTANTS =====================

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ShopCore',
  description: 'Internet store',
};

// ===================== ROUTING =====================

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

// ===================== HELPERS =====================

function isLocale(value: string): value is Locale {
  return routing.locales.includes(value as Locale);
}

// ===================== COMPONENT =====================

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // ===================== DERIVED VALUES =====================

  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // ===================== RENDER =====================

  return (
    <html
      lang={locale}
      data-theme="shopcore-light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <ApiQueryProvider>
            <main className="flex flex-1 flex-col">{children}</main>
          </ApiQueryProvider>
          <ToastProvider />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
