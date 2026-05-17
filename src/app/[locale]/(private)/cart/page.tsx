import { CartPage } from '@/page-components/store/cart-page';
import { StorefrontAccessGuard } from '@/domains/store/ui';

// ========== Component ==========

export default function CartRoute() {
  return (
    <StorefrontAccessGuard>
      <CartPage />
    </StorefrontAccessGuard>
  );
}
