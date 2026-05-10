import { AuthProvider } from '@/domains/auth/model/providers/auth-provider';
import { Header } from '@/shared/ui/header';

// ===================== TYPES =====================
type PrivateLayoutProps = {
  children: React.ReactNode;
};

// ===================== COMPONENT =====================

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  // ===================== RENDER =====================

  return (
    <AuthProvider>
      <div className="min-h-full bg-canvas text-primary">
        <Header />
        <div className="ds-container py-8">{children}</div>
      </div>
    </AuthProvider>
  );
}
