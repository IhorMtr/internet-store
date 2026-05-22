// ===================== Types =====================

export type CategoryRow = {
  category_id: number;
  category_name: string;
  description: string | null;
};

export type ProductRow = {
  product_id: number;
  category_id: number;
  category_name?: string | null;
  name: string;
  price: number | string;
  stock_quantity: number;
  discount: number | string;
  description: string | null;
  image_url: string | null;
  image_public_id: string | null;
};

export type SupplierRow = {
  supplier_id: number;
  name: string;
  phone_number: string | null;
  email: string | null;
};

export type DeliveryRow = {
  delivery_id: number;
  supplier_id: number;
  supplier_name: string;
  delivery_date: Date | string;
  invoice_number: string;
};

export type DeliveryItemRow = {
  delivery_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  supply_price: number | string;
};

export type AdminOrderListRow = {
  order_id: number;
  customer_id: number;
  customer_name: string;
  order_date: Date | string;
  status: string;
  total_amount: number | string;
  payment_method: string | null;
  shipping_status: string | null;
};

export type UserOrderListRow = {
  order_id: number;
  order_date: Date | string;
  order_status: string;
  total_amount: number | string;
  payment_method: string | null;
  payment_status: string | null;
  shipping_status: string | null;
};

export type UserOrderDetailsRow = {
  order_item_id: number;
  order_id: number;
  order_date: Date | string;
  order_status: string;
  total_amount: number | string;
  customer_id: number;
  customer_name: string;
  phone_number: string | null;
  email: string | null;
  product_id: number;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  sale_price: number | string;
  item_discount: number | string;
  line_amount: number | string;
  payment_date: Date | string | null;
  payment_amount: number | string | null;
  payment_method: string | null;
  payment_status: string | null;
  shipping_service: string | null;
  tracking_number: string | null;
  shipping_address: string | null;
  shipping_status: string | null;
};

export type UserPaymentRow = {
  payment_id: number;
  order_id: number;
  payment_date: Date | string;
  amount: number | string;
  payment_method: string;
  status: string;
};

export type OrderPaymentSourceRow = {
  order_id: number;
  total_amount: number | string;
  status: string;
  payment_method: string | null;
};

export type ReportSoldProductsRow = {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_amount: number | string;
};

export type ReportTopCategoriesRow = {
  category_id: number;
  category_name: string;
  total_quantity: number;
  total_amount: number | string;
};

export type PostgresError = Error & {
  code?: string;
  constraint?: string;
  detail?: string;
};
