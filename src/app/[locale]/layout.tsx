import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { ApiQueryProvider } from '@/shared/providers/api-query-provider';
import { ToastProvider } from '@/shared/providers/toast-provider';
import { getThemeInitScript } from '@/shared/ui/theme/theme-init-script';
import { ThemeInitializer } from '@/shared/ui/theme/theme-initializer';
import '../globals.css';

// ========== Constants ==========

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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
};

// ========== Routing ==========

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

// ========== Helpers ==========

function isLocale(value: string): value is Locale {
  return routing.locales.includes(value as Locale);
}

// ========== Component ==========

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // ========== Derived Values ==========

  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // ========== Render ==========

  return (
    <html
      lang={locale}
      data-theme="shopcore-light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Script
          id="shopcore-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getThemeInitScript() }}
        />
        <NextIntlClientProvider>
          <ThemeInitializer />
          <ApiQueryProvider>
            <main className="flex flex-1 flex-col">{children}</main>
          </ApiQueryProvider>
          <ToastProvider />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
