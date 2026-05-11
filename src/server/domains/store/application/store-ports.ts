import type {
  AdminOrderDetailsRow,
  AdminOrderListItem,
  AdminSummary,
  Category,
  CreateDeliveryInput,
  Delivery,
  DeliveryItem,
  PaymentInput,
  Product,
  ShipmentInput,
  SoldProductReportRow,
  Supplier,
  TopCategoryReportRow,
} from '@/server/domains/store/domain/store-models';

// ===================== TYPES =====================
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

export type ProductListFilters = {
  search: string | null;
  categoryId: number | null;
};

export type OrdersListFilters = {
  status: string | null;
  customerId: number | null;
};

export type DeliveryDetails = {
  delivery: Delivery;
  items: DeliveryItem[];
};

export interface StoreRepository {
  listCategories(): Promise<Category[]>;
  createCategory(input: CategoryInput): Promise<Category>;
  getCategoryById(categoryId: number): Promise<Category | null>;
  updateCategory(categoryId: number, input: CategoryInput): Promise<Category | null>;
  deleteCategory(categoryId: number): Promise<boolean>;

  listProducts(filters: ProductListFilters): Promise<Product[]>;
  createProduct(input: ProductInput): Promise<Product>;
  getProductById(productId: number): Promise<Product | null>;
  updateProduct(productId: number, input: ProductInput): Promise<Product | null>;
  deleteProduct(productId: number): Promise<boolean>;

  listSuppliers(): Promise<Supplier[]>;
  createSupplier(input: SupplierInput): Promise<Supplier>;
  getSupplierById(supplierId: number): Promise<Supplier | null>;
  updateSupplier(supplierId: number, input: SupplierInput): Promise<Supplier | null>;
  deleteSupplier(supplierId: number): Promise<boolean>;

  listDeliveries(): Promise<Delivery[]>;
  createDelivery(input: CreateDeliveryInput): Promise<number>;
  getDeliveryById(deliveryId: number): Promise<DeliveryDetails | null>;

  listOrders(filters: OrdersListFilters): Promise<AdminOrderListItem[]>;
  getOrderDetails(orderId: number): Promise<AdminOrderDetailsRow[]>;

  createShipment(orderId: number, input: ShipmentInput): Promise<number>;
  updateShipment(orderId: number, input: ShipmentInput): Promise<boolean>;

  registerPayment(orderId: number, input: PaymentInput): Promise<number>;

  getSoldProductsByDate(date: string): Promise<SoldProductReportRow[]>;
  getTopCategoriesByPeriod(dateFrom: string, dateTo: string): Promise<TopCategoryReportRow[]>;

  getAdminSummary(lowStockThreshold: number): Promise<AdminSummary>;
}
