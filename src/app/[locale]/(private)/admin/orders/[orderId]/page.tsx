import { notFound } from 'next/navigation';
import { AdminOrderDetailsPage } from '@/page-components/admin/admin-order-details-page';

type AdminOrderDetailsRouteProps = {
  params: Promise<{ orderId: string }>;
};

// ===================== COMPONENT =====================
export default async function AdminOrderDetailsRoute({ params }: AdminOrderDetailsRouteProps) {
  const { orderId } = await params;
  const parsedOrderId = Number(orderId);

  if (!Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
    notFound();
  }

  return <AdminOrderDetailsPage orderId={parsedOrderId} />;
}
