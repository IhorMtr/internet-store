import type { BaseResponse } from '@/shared/api/types';
import type { PaymentMethod } from '@/shared/lib/payment-method';

// ========== Types ==========

export type StoreCategory = {
  categoryId: number;
  categoryName: string;
  description: string | null;
};

export type StoreProduct = {
  productId: number;
  categoryId: number;
  name: string;
  price: number;
  stockQuantity: number;
  discount: number;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
};

export type StoreOrder = {
  orderId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  shippingStatus: string | null;
};

export type StoreOrderItem = {
  orderItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  salePrice: number;
  discount: number;
  lineAmount: number;
};

export type StorePayment = {
  paymentId: number;
  orderId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  status: string;
};

export type StorePaymentDetails = {
  paymentDate: string | null;
  amount: number | null;
  paymentMethod: string | null;
  status: string | null;
};

export type StoreShipment = {
  shippingService: string | null;
  trackingNumber: string | null;
  shippingAddress: string | null;
  shippingStatus: string | null;
};

export type StoreOrderDetails = {
  orderId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  selectedPaymentMethod: string | null;
  payment: StorePaymentDetails | null;
  shipment: StoreShipment | null;
  items: StoreOrderItem[];
};

export type CreateStoreOrderItemInput = {
  productId: number;
  quantity: number;
};

export type CreateStoreOrderShipmentInput = {
  shippingService: string;
  trackingNumber?: string | null;
  shippingAddress: string;
  shippingStatus?: string;
};

export type CreateStoreOrderInput = {
  items: CreateStoreOrderItemInput[];
  shipment?: CreateStoreOrderShipmentInput | null;
  paymentMethod: PaymentMethod;
};

export type PayStoreOrderInput = {
  paymentMethod?: PaymentMethod;
};

export type StoreProductsFilters = {
  search?: string | null;
  categoryId?: number | null;
};

export type StoreCartItem = {
  productId: number;
  name: string;
  imageUrl: string | null;
  price: number;
  discount: number;
  stockQuantity: number;
  quantity: number;
};

// ========== Responses ==========

export type StoreCategoriesResponse = BaseResponse<{ categories: StoreCategory[] }>;
export type StoreProductsResponse = BaseResponse<{ products: StoreProduct[] }>;
export type StoreProductResponse = BaseResponse<{ product: StoreProduct }>;
export type StoreOrdersResponse = BaseResponse<{ orders: StoreOrder[] }>;
export type StoreOrderResponse = BaseResponse<{ order: StoreOrderDetails }>;
export type StorePaymentResponse = BaseResponse<{ payment: StorePayment }>;
