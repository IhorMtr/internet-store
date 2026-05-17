import { CheckoutPage } from '@/page-components/store/checkout-page';
import { StorefrontAccessGuard } from '@/domains/store/ui';

// ========== Component ==========

export default function CheckoutRoute() {
  return (
    <StorefrontAccessGuard>
      <CheckoutPage />
    </StorefrontAccessGuard>
  );
}
