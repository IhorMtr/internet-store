'use client';

import { Link } from '@/i18n/navigation';
import { ProductCard } from '@/domains/store/ui';
import { useCatalogPage } from '@/page-components/store/catalog-page/use-catalog-page';
import { Button, Input, Select } from '@/shared/ui';

// ========== Component ==========

export function CatalogPage() {
  const {
    addProductToCart,
    cartItemsCount,
    cartQuantityByProductId,
    categoryNameById,
    categoryOptions,
    isLoading,
    products,
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    t,
  } = useCatalogPage();

  // ========== Render ==========

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('subtitle')}</p>
        </div>

        <Link href="/cart">
          <Button type="button" variant="secondary">
            {t('cartLink', { count: cartItemsCount })}
          </Button>
        </Link>
      </div>

      <section className="grid gap-3 rounded-lg border bg-surface p-4 shadow-soft md:grid-cols-[minmax(0,1fr)_260px]">
        <label className="grid gap-1 text-sm">
          <span>{t('filters.searchLabel')}</span>
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t('filters.searchPlaceholder')}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span>{t('filters.categoryLabel')}</span>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} options={categoryOptions} />
        </label>
      </section>

      {isLoading ? (
        <div className="rounded-lg border bg-surface p-6 text-sm text-muted shadow-soft">{t('loading')}</div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border bg-surface p-6 text-sm text-muted shadow-soft">{t('empty')}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map(product => (
            <ProductCard
              key={product.productId}
              product={product}
              categoryName={categoryNameById.get(product.categoryId)}
              inCartQuantity={cartQuantityByProductId.get(product.productId) ?? 0}
              onAddToCart={addProductToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
