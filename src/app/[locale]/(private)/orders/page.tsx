import { OrdersPage } from '@/page-components/store/orders-page';
import { StorefrontAccessGuard } from '@/domains/store/ui';

// ========== Component ==========

export default function OrdersRoute() {
  return (
    <StorefrontAccessGuard>
      <OrdersPage />
    </StorefrontAccessGuard>
  );
}
