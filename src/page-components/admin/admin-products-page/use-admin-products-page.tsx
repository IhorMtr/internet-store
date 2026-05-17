'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  useAdminCategoriesQuery,
  useDeleteProductImageMutation,
  useAdminProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useUpdateProductMutation,
} from '@/domains/admin/model/hooks';
import type { AdminProduct, ProductInput } from '@/domains/admin/model/types';
import { formatCurrency } from '@/domains/admin/lib/admin-utils';
import { Button } from '@/shared/ui/button';
import { ProductImage } from '@/shared/ui/product-image/ProductImage';

// ========== Types ==========

type ProductFormValues = {
  categoryId: string;
  name: string;
  price: string;
  stockQuantity: string;
  discount: string;
  description: string;
};

// ========== Constants ==========

const ALL_CATEGORIES_VALUE = '__all__';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// ========== Hook ==========

export function useAdminProductsPage() {
  // ========== Translations ==========

  const locale = useLocale();
  const t = useTranslations('AdminProducts');
  const commonT = useTranslations('Admin');

  // ========== State ==========

  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORIES_VALUE);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null);
  const [selectedImageError, setSelectedImageError] = useState<string | null>(null);

  const clearSelectedImage = useCallback(() => {
    setSelectedImageFile(null);
    setSelectedImageError(null);

    setSelectedImagePreviewUrl(previous => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }

      return null;
    });
  }, []);

  const startEditing = useCallback(
    (product: AdminProduct) => {
      clearSelectedImage();
      setEditingProduct(product);
    },
    [clearSelectedImage]
  );

  // ========== Queries ==========

  const categoriesQuery = useAdminCategoriesQuery();
  const productsQuery = useAdminProductsQuery({
    search: search.trim() || null,
    categoryId: selectedCategoryId === ALL_CATEGORIES_VALUE ? null : Number(selectedCategoryId),
  });

  // ========== Mutations ==========

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation(editingProduct?.productId ?? 0);
  const deleteMutation = useDeleteProductMutation();
  const uploadImageMutation = useUploadProductImageMutation();
  const deleteImageMutation = useDeleteProductImageMutation();

  // ========== Derived Values ==========

  const categories = categoriesQuery.data?.data.categories ?? [];
  const products = productsQuery.data?.data.products ?? [];

  const categoryFilterOptions = [
    { label: t('filters.allCategories'), value: ALL_CATEGORIES_VALUE },
    ...categories.map(category => ({
      label: category.categoryName,
      value: String(category.categoryId),
    })),
  ];

  const categoryOptions = categories.map(category => ({
    label: category.categoryName,
    value: String(category.categoryId),
  }));

  const formInitialValues: ProductFormValues = {
    categoryId: editingProduct ? String(editingProduct.categoryId) : '',
    name: editingProduct?.name ?? '',
    price: editingProduct ? String(editingProduct.price) : '0',
    stockQuantity: editingProduct ? String(editingProduct.stockQuantity) : '0',
    discount: editingProduct ? String(editingProduct.discount) : '0',
    description: editingProduct?.description ?? '',
  };

  const formMode: 'create' | 'edit' = editingProduct ? 'edit' : 'create';

  const currentImageUrl = editingProduct?.imageUrl ?? null;
  const imagePreviewUrl = selectedImagePreviewUrl;

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
    };
  }, [selectedImagePreviewUrl]);

  // ========== Table Columns ==========

  const columns = useMemo<Array<ColumnDef<AdminProduct>>>(
    () => [
      {
        id: 'image',
        header: t('table.image'),
        cell: ({ row }) => (
          <div className="flex w-16 items-center justify-center">
            <ProductImage
              src={row.original.imageUrl}
              alt={row.original.name}
              fallbackLabel={t('table.noImage')}
              variant="thumbnail"
              size="sm"
              showFallbackText={false}
              sizes="48px"
            />
          </div>
        ),
      },
      {
        accessorKey: 'productId',
        header: t('table.id'),
      },
      {
        accessorKey: 'name',
        header: t('table.name'),
      },
      {
        accessorKey: 'categoryId',
        header: t('table.categoryId'),
      },
      {
        accessorKey: 'price',
        header: t('table.price'),
        cell: ({ row }) => formatCurrency(row.original.price, locale),
      },
      {
        accessorKey: 'stockQuantity',
        header: t('table.stock'),
      },
      {
        accessorKey: 'discount',
        header: t('table.discount'),
        cell: ({ row }) => `${row.original.discount}%`,
      },
      {
        id: 'actions',
        header: t('table.actions'),
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => startEditing(row.original)}>
              {t('actions.edit')}
            </Button>

            <Button
              size="sm"
              variant="danger"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(row.original)}
            >
              {t('actions.delete')}
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation.isPending, locale, startEditing, t]
  );

  // ========== Handlers ==========

  function selectImage(file: File | null) {
    clearSelectedImage();

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      setSelectedImageError(t('form.image.unsupportedFormat'));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setSelectedImageError(t('form.image.fileTooLarge'));
      return;
    }

    setSelectedImageFile(file);
    setSelectedImagePreviewUrl(URL.createObjectURL(file));
  }

  async function submitProduct(values: ProductFormValues) {
    const payload: ProductInput = {
      categoryId: Number(values.categoryId),
      name: values.name.trim(),
      price: Number(values.price),
      stockQuantity: Number(values.stockQuantity),
      discount: Number(values.discount),
      description: values.description.trim() || null,
    };

    const savedProduct = editingProduct
      ? (await updateMutation.mutateAsync(payload)).data.product
      : (await createMutation.mutateAsync(payload)).data.product;

    if (selectedImageFile) {
      try {
        await uploadImageMutation.mutateAsync({
          productId: savedProduct.productId,
          file: selectedImageFile,
        });
      } catch {
        // Product save should remain successful even if image upload fails.
      }
    }

    clearSelectedImage();

    if (editingProduct) {
      setEditingProduct(null);
    }
  }

  function cancelEditing() {
    clearSelectedImage();
    setEditingProduct(null);
  }

  async function removeProductImage() {
    if (!editingProduct) {
      return;
    }

    const response = await deleteImageMutation.mutateAsync(editingProduct.productId);
    clearSelectedImage();
    setEditingProduct(response.data.product);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    await deleteMutation.mutateAsync(deleteTarget.productId);

    if (editingProduct?.productId === deleteTarget.productId) {
      clearSelectedImage();
      setEditingProduct(null);
    }

    setDeleteTarget(null);
  }

  // ========== Return Values ==========

  return {
    t,
    commonT,
    products,
    columns,
    search,
    selectedCategoryId,
    setSearch,
    setSelectedCategoryId,
    categoryFilterOptions,
    categoryOptions,
    isTableLoading: productsQuery.isLoading,
    isFormSubmitting: createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending,
    isImageRemoving: deleteImageMutation.isPending,
    formMode,
    formInitialValues,
    currentImageUrl,
    imagePreviewUrl,
    selectedImageError,
    selectedImageFile,
    submitProduct,
    selectImage,
    removeProductImage,
    cancelEditing,
    deleteTarget,
    isDeleteDialogOpen: Boolean(deleteTarget),
    closeDeleteDialog: () => setDeleteTarget(null),
    confirmDelete,
    isDeleteSubmitting: deleteMutation.isPending,
  };
}
