import { apiClient } from '@/shared/api/client';
import type {
  CreateStoreOrderInput,
  PayStoreOrderInput,
  StoreCategoriesResponse,
  StoreOrderResponse,
  StoreOrdersResponse,
  StorePaymentResponse,
  StoreProductResponse,
  StoreProductsFilters,
  StoreProductsResponse,
} from '@/domains/store/model/types';

// ========== Helpers ==========

function createProductsSearchParams(filters: StoreProductsFilters = {}): string {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set('search', filters.search.trim());
  }

  if (filters.categoryId) {
    searchParams.set('categoryId', String(filters.categoryId));
  }

  const query = searchParams.toString();

  return query.length > 0 ? `?${query}` : '';
}

// ========== API ==========

export const storeApi = {
  async getCategories(): Promise<StoreCategoriesResponse> {
    const response = await apiClient.get<StoreCategoriesResponse>('/store/categories');

    return response.data;
  },

  async getProducts(filters: StoreProductsFilters = {}): Promise<StoreProductsResponse> {
    const response = await apiClient.get<StoreProductsResponse>(
      `/store/products${createProductsSearchParams(filters)}`
    );

    return response.data;
  },

  async getProduct(productId: number): Promise<StoreProductResponse> {
    const response = await apiClient.get<StoreProductResponse>(`/store/products/${productId}`);

    return response.data;
  },

  async getOrders(): Promise<StoreOrdersResponse> {
    const response = await apiClient.get<StoreOrdersResponse>('/store/orders');

    return response.data;
  },

  async createOrder(input: CreateStoreOrderInput): Promise<StoreOrderResponse> {
    const response = await apiClient.post<StoreOrderResponse>('/store/orders', input);

    return response.data;
  },

  async getOrder(orderId: number): Promise<StoreOrderResponse> {
    const response = await apiClient.get<StoreOrderResponse>(`/store/orders/${orderId}`);

    return response.data;
  },

  async payOrder(orderId: number, input: PayStoreOrderInput = {}): Promise<StorePaymentResponse> {
    const response = await apiClient.post<StorePaymentResponse>(`/store/orders/${orderId}/payment`, input);

    return response.data;
  },

  async cancelOrder(orderId: number): Promise<StoreOrderResponse> {
    const response = await apiClient.post<StoreOrderResponse>(`/store/orders/${orderId}/cancel`, {});

    return response.data;
  },
};
