import type { BaseResponse } from '@/shared/api/types';
import type { PaymentMethod } from '@/shared/lib/payment-method';

// ========== Types ==========
export type AdminSummary = {
  productsCount: number;
  categoriesCount: number;
  suppliersCount: number;
  ordersCount: number;
  lowStockProductsCount: number;
  availableProductsCount: number;
};

export type AdminCategory = {
  categoryId: number;
  categoryName: string;
  description: string | null;
};

export type AdminProduct = {
  productId: number;
  categoryId: number;
  categoryName: string | null;
  name: string;
  price: number;
  stockQuantity: number;
  discount: number;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
};

export type AdminSupplier = {
  supplierId: number;
  name: string;
  phoneNumber: string | null;
  email: string | null;
};

export type AdminDelivery = {
  deliveryId: number;
  supplierId: number;
  supplierName: string;
  deliveryDate: string;
  invoiceNumber: string;
};

export type AdminDeliveryItem = {
  deliveryId: number;
  productId: number;
  productName: string;
  quantity: number;
  supplyPrice: number;
};

export type AdminDeliveryDetails = {
  delivery: AdminDelivery;
  items: AdminDeliveryItem[];
};

export type AdminOrderListItem = {
  orderId: number;
  customerId: number;
  customerName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  paymentMethod: string | null;
  shippingStatus: string | null;
};

export type AdminOrderDetailsRow = {
  order_item_id: number;
  order_id: number;
  order_date: string;
  order_status: string;
  total_amount: number | string;
  customer_id: number;
  customer_name: string;
  phone_number: string | null;
  email: string | null;
  product_id: number;
  product_name: string;
  quantity: number;
  sale_price: number | string;
  item_discount: number | string;
  line_amount: number | string;
  payment_date: string | null;
  payment_amount: number | string | null;
  payment_method: string | null;
  payment_status: string | null;
  shipping_service: string | null;
  tracking_number: string | null;
  shipping_address: string | null;
  shipping_status: string | null;
};

export type SoldProductReportRow = {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
};

export type TopCategoryReportRow = {
  categoryId: number;
  categoryName: string;
  totalQuantity: number;
  totalAmount: number;
};

// ========== Requests ==========
export type CategoryInput = {
  categoryName: string;
  description: string | null;
};

export type ProductInput = {
  categoryId: number;
  name: string;
  price: number;
  stockQuantity: number;
  discount: number;
  description: string | null;
};

export type SupplierInput = {
  name: string;
  phoneNumber: string | null;
  email: string | null;
};

export type DeliveryItemInput = {
  productId: number;
  quantity: number;
  supplyPrice: number;
};

export type CreateDeliveryInput = {
  supplierId: number;
  deliveryDate: string;
  invoiceNumber: string;
  items: DeliveryItemInput[];
};

export type ShipmentInput = {
  shippingService: string;
  trackingNumber: string;
  shippingAddress: string;
  shippingStatus: string;
};

export type PaymentInput = {
  paymentMethod: PaymentMethod;
};

export type ProductsFilters = {
  search?: string | null;
  categoryId?: number | null;
};

export type OrdersFilters = {
  status?: string | null;
  customerId?: number | null;
};

// ========== Responses ==========
export type AdminSummaryResponse = BaseResponse<{ summary: AdminSummary }>;

export type CategoriesResponse = BaseResponse<{ categories: AdminCategory[] }>;
export type CategoryResponse = BaseResponse<{ category: AdminCategory }>;
export type DeletedResponse = BaseResponse<{ deleted: boolean }>;

export type ProductsResponse = BaseResponse<{ products: AdminProduct[] }>;
export type ProductResponse = BaseResponse<{ product: AdminProduct }>;

export type SuppliersResponse = BaseResponse<{ suppliers: AdminSupplier[] }>;
export type SupplierResponse = BaseResponse<{ supplier: AdminSupplier }>;

export type DeliveriesResponse = BaseResponse<{ deliveries: AdminDelivery[] }>;
export type DeliveryDetailsResponse = BaseResponse<AdminDeliveryDetails>;
export type DeliveryCreatedResponse = BaseResponse<{ deliveryId: number }>;

export type OrdersResponse = BaseResponse<{ orders: AdminOrderListItem[] }>;
export type OrderDetailsResponse = BaseResponse<{ details: AdminOrderDetailsRow[] }>;

export type ShipmentCreatedResponse = BaseResponse<{ shipmentId: number }>;
export type UpdatedResponse = BaseResponse<{ updated: boolean }>;
export type PaymentCreatedResponse = BaseResponse<{ paymentId: number }>;

export type SoldProductsReportResponse = BaseResponse<{ rows: SoldProductReportRow[] }>;
export type TopCategoriesReportResponse = BaseResponse<{ rows: TopCategoryReportRow[] }>;
