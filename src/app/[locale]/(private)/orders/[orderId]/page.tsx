import { notFound } from 'next/navigation';
import { StorefrontAccessGuard } from '@/domains/store/ui';
import { OrderDetailsPage } from '@/page-components/store/order-details-page';

// ========== Types ==========

type OrderDetailsRouteProps = {
  params: Promise<{ orderId: string }>;
};

// ========== Component ==========

export default async function OrderDetailsRoute({ params }: OrderDetailsRouteProps) {
  const { orderId } = await params;
  const parsedOrderId = Number(orderId);

  if (!Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
    notFound();
  }

  return (
    <StorefrontAccessGuard>
      <OrderDetailsPage orderId={parsedOrderId} />
    </StorefrontAccessGuard>
  );
}
