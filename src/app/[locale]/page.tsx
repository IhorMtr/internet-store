'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

// ===================== COMPONENT =====================

export default function LocaleEntryPage() {
  // ===================== HOOKS =====================

  const router = useRouter();

  // ===================== EFFECTS =====================

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  // ===================== RENDER =====================

  return null;
}
