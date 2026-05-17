import { apiClient } from '@/shared/api/client';
import type {
  AdminSummaryResponse,
  CategoriesResponse,
  CategoryInput,
  CategoryResponse,
  CreateDeliveryInput,
  DeletedResponse,
  DeliveriesResponse,
  DeliveryCreatedResponse,
  DeliveryDetailsResponse,
  OrderDetailsResponse,
  OrdersFilters,
  OrdersResponse,
  PaymentCreatedResponse,
  PaymentInput,
  ProductInput,
  ProductResponse,
  ProductsFilters,
  ProductsResponse,
  ShipmentCreatedResponse,
  ShipmentInput,
  SoldProductsReportResponse,
  SupplierInput,
  SupplierResponse,
  SuppliersResponse,
  TopCategoriesReportResponse,
  UpdatedResponse,
} from '@/domains/admin/model/types/admin.types';

// ========== Helpers ==========
function createProductsSearchParams(filters: ProductsFilters): string {
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

function createOrdersSearchParams(filters: OrdersFilters): string {
  const searchParams = new URLSearchParams();

  if (filters.status?.trim()) {
    searchParams.set('status', filters.status.trim());
  }

  if (filters.customerId) {
    searchParams.set('customerId', String(filters.customerId));
  }

  const query = searchParams.toString();

  return query.length > 0 ? `?${query}` : '';
}

// ========== API ==========
export const adminApi = {
  async getSummary(): Promise<AdminSummaryResponse> {
    const response = await apiClient.get<AdminSummaryResponse>('/admin/summary');

    return response.data;
  },

  async getCategories(): Promise<CategoriesResponse> {
    const response = await apiClient.get<CategoriesResponse>('/admin/categories');

    return response.data;
  },

  async createCategory(input: CategoryInput): Promise<CategoryResponse> {
    const response = await apiClient.post<CategoryResponse>('/admin/categories', input);

    return response.data;
  },

  async getCategoryById(categoryId: number): Promise<CategoryResponse> {
    const response = await apiClient.get<CategoryResponse>(`/admin/categories/${categoryId}`);

    return response.data;
  },

  async updateCategory(categoryId: number, input: Partial<CategoryInput>): Promise<CategoryResponse> {
    const response = await apiClient.patch<CategoryResponse>(`/admin/categories/${categoryId}`, input);

    return response.data;
  },

  async deleteCategory(categoryId: number): Promise<DeletedResponse> {
    const response = await apiClient.delete<DeletedResponse>(`/admin/categories/${categoryId}`);

    return response.data;
  },

  async getProducts(filters: ProductsFilters = {}): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(`/admin/products${createProductsSearchParams(filters)}`);

    return response.data;
  },

  async createProduct(input: ProductInput): Promise<ProductResponse> {
    const response = await apiClient.post<ProductResponse>('/admin/products', input);

    return response.data;
  },

  async getProductById(productId: number): Promise<ProductResponse> {
    const response = await apiClient.get<ProductResponse>(`/admin/products/${productId}`);

    return response.data;
  },

  async updateProduct(productId: number, input: Partial<ProductInput>): Promise<ProductResponse> {
    const response = await apiClient.patch<ProductResponse>(`/admin/products/${productId}`, input);

    return response.data;
  },

  async deleteProduct(productId: number): Promise<DeletedResponse> {
    const response = await apiClient.delete<DeletedResponse>(`/admin/products/${productId}`);

    return response.data;
  },

  async uploadProductImage(productId: number, file: File): Promise<ProductResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ProductResponse>(`/admin/products/${productId}/image`, formData);

    return response.data;
  },

  async deleteProductImage(productId: number): Promise<ProductResponse> {
    const response = await apiClient.delete<ProductResponse>(`/admin/products/${productId}/image`);

    return response.data;
  },

  async getSuppliers(): Promise<SuppliersResponse> {
    const response = await apiClient.get<SuppliersResponse>('/admin/suppliers');

    return response.data;
  },

  async createSupplier(input: SupplierInput): Promise<SupplierResponse> {
    const response = await apiClient.post<SupplierResponse>('/admin/suppliers', input);

    return response.data;
  },

  async getSupplierById(supplierId: number): Promise<SupplierResponse> {
    const response = await apiClient.get<SupplierResponse>(`/admin/suppliers/${supplierId}`);

    return response.data;
  },

  async updateSupplier(supplierId: number, input: Partial<SupplierInput>): Promise<SupplierResponse> {
    const response = await apiClient.patch<SupplierResponse>(`/admin/suppliers/${supplierId}`, input);

    return response.data;
  },

  async deleteSupplier(supplierId: number): Promise<DeletedResponse> {
    const response = await apiClient.delete<DeletedResponse>(`/admin/suppliers/${supplierId}`);

    return response.data;
  },

  async getDeliveries(): Promise<DeliveriesResponse> {
    const response = await apiClient.get<DeliveriesResponse>('/admin/deliveries');

    return response.data;
  },

  async createDelivery(input: CreateDeliveryInput): Promise<DeliveryCreatedResponse> {
    const response = await apiClient.post<DeliveryCreatedResponse>('/admin/deliveries', input);

    return response.data;
  },

  async getDeliveryById(deliveryId: number): Promise<DeliveryDetailsResponse> {
    const response = await apiClient.get<DeliveryDetailsResponse>(`/admin/deliveries/${deliveryId}`);

    return response.data;
  },

  async getOrders(filters: OrdersFilters = {}): Promise<OrdersResponse> {
    const response = await apiClient.get<OrdersResponse>(`/admin/orders${createOrdersSearchParams(filters)}`);

    return response.data;
  },

  async getOrderDetails(orderId: number): Promise<OrderDetailsResponse> {
    const response = await apiClient.get<OrderDetailsResponse>(`/admin/orders/${orderId}`);

    return response.data;
  },

  async createShipment(orderId: number, input: ShipmentInput): Promise<ShipmentCreatedResponse> {
    const response = await apiClient.post<ShipmentCreatedResponse>(`/admin/orders/${orderId}/shipment`, input);

    return response.data;
  },

  async updateShipment(orderId: number, input: ShipmentInput): Promise<UpdatedResponse> {
    const response = await apiClient.patch<UpdatedResponse>(`/admin/orders/${orderId}/shipment`, input);

    return response.data;
  },

  async registerPayment(orderId: number, input: PaymentInput): Promise<PaymentCreatedResponse> {
    const response = await apiClient.post<PaymentCreatedResponse>(`/admin/orders/${orderId}/payment`, input);

    return response.data;
  },

  async getSoldProductsByDate(date: string): Promise<SoldProductsReportResponse> {
    const response = await apiClient.get<SoldProductsReportResponse>(
      `/admin/reports/sold-products?date=${encodeURIComponent(date)}`
    );

    return response.data;
  },

  async getTopCategoriesByPeriod(dateFrom: string, dateTo: string): Promise<TopCategoriesReportResponse> {
    const response = await apiClient.get<TopCategoriesReportResponse>(
      `/admin/reports/top-categories?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`
    );

    return response.data;
  },
};
