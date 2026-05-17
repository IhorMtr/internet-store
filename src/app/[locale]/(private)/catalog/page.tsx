import { CatalogPage } from '@/page-components/store/catalog-page';
import { StorefrontAccessGuard } from '@/domains/store/ui';

// ========== Component ==========

export default function CatalogRoute() {
  return (
    <StorefrontAccessGuard>
      <CatalogPage />
    </StorefrontAccessGuard>
  );
}
