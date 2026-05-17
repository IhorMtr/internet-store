import { notFound } from 'next/navigation';
import { StorefrontAccessGuard } from '@/domains/store/ui';
import { ProductDetailsPage } from '@/page-components/store/product-details-page';

// ========== Types ==========

type ProductDetailsRouteProps = {
  params: Promise<{ productId: string }>;
};

// ========== Component ==========

export default async function ProductDetailsRoute({ params }: ProductDetailsRouteProps) {
  const { productId } = await params;
  const parsedProductId = Number(productId);

  if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
    notFound();
  }

  return (
    <StorefrontAccessGuard>
      <ProductDetailsPage productId={parsedProductId} />
    </StorefrontAccessGuard>
  );
}
