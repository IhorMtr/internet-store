import { AdminLayout } from '@/page-components/admin/admin-layout';

type AdminRouteLayoutProps = {
  children: React.ReactNode;
};

// ===================== COMPONENT =====================
export default function AdminRouteLayout({ children }: AdminRouteLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
