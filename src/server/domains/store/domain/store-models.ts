// ===================== TYPES =====================
export type Category = {
  categoryId: number;
  categoryName: string;
  description: string | null;
};

export type Product = {
  productId: number;
  categoryId: number;
  name: string;
  price: number;
  stockQuantity: number;
  discount: number;
  description: string | null;
};

export type Supplier = {
  supplierId: number;
  name: string;
  phoneNumber: string | null;
  email: string | null;
};

export type Delivery = {
  deliveryId: number;
  supplierId: number;
  supplierName: string;
  deliveryDate: string;
  invoiceNumber: string;
};

export type DeliveryItem = {
  deliveryId: number;
  productId: number;
  productName: string;
  quantity: number;
  supplyPrice: number;
};

export type CreateDeliveryInput = {
  supplierId: number;
  deliveryDate: string;
  invoiceNumber: string;
  items: Array<{
    productId: number;
    quantity: number;
    supplyPrice: number;
  }>;
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
  [key: string]: unknown;
  orderId: number;
};

export type ShipmentInput = {
  shippingService: string;
  trackingNumber: string;
  shippingAddress: string;
  shippingStatus: string;
};

export type PaymentInput = {
  paymentMethod: string;
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

export type AdminSummary = {
  productsCount: number;
  categoriesCount: number;
  suppliersCount: number;
  ordersCount: number;
  lowStockProductsCount: number;
  availableProductsCount: number;
};
