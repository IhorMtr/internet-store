import type {
  AdminOrderDetailsRow,
  AdminOrderListItem,
  Category,
  Delivery,
  DeliveryItem,
  Product,
  Supplier,
  UserOrderDetails,
  UserOrderItem,
  UserOrderListItem,
  UserPayment,
} from '@/server/domains/store/domain/store-models';
import type {
  AdminOrderListRow,
  CategoryRow,
  DeliveryItemRow,
  DeliveryRow,
  ProductRow,
  SupplierRow,
  UserOrderDetailsRow,
  UserOrderListRow,
  UserPaymentRow,
} from '@/server/domains/store/infrastructure/postgres/store-row-types';
import {
  toDateString,
  toNullableDateString,
  toNullableNumber,
  toNumber,
} from '@/server/domains/store/infrastructure/postgres/store-sql-utils';

// ===================== Mappers =====================

export function mapCategory(row: CategoryRow): Category {
  return {
    categoryId: row.category_id,
    categoryName: row.category_name,
    description: row.description,
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    productId: row.product_id,
    categoryId: row.category_id,
    name: row.name,
    price: toNumber(row.price),
    stockQuantity: row.stock_quantity,
    discount: toNumber(row.discount),
    description: row.description,
    imageUrl: row.image_url,
    imagePublicId: row.image_public_id,
  };
}

export function mapSupplier(row: SupplierRow): Supplier {
  return {
    supplierId: row.supplier_id,
    name: row.name,
    phoneNumber: row.phone_number,
    email: row.email,
  };
}

export function mapDelivery(row: DeliveryRow): Delivery {
  return {
    deliveryId: row.delivery_id,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    deliveryDate: toDateString(row.delivery_date),
    invoiceNumber: row.invoice_number,
  };
}

export function mapDeliveryItem(row: DeliveryItemRow): DeliveryItem {
  return {
    deliveryId: row.delivery_id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    supplyPrice: toNumber(row.supply_price),
  };
}

export function mapOrderListRow(row: AdminOrderListRow): AdminOrderListItem {
  return {
    orderId: row.order_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    orderDate: toDateString(row.order_date),
    status: row.status,
    totalAmount: toNumber(row.total_amount),
    paymentMethod: row.payment_method,
    shippingStatus: row.shipping_status,
  };
}

export function mapUserOrderListRow(row: UserOrderListRow): UserOrderListItem {
  return {
    orderId: row.order_id,
    orderDate: toDateString(row.order_date),
    status: row.order_status,
    totalAmount: toNumber(row.total_amount),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    shippingStatus: row.shipping_status,
  };
}

export function mapUserPayment(row: UserPaymentRow): UserPayment {
  return {
    paymentId: row.payment_id,
    orderId: row.order_id,
    paymentDate: toDateString(row.payment_date),
    amount: toNumber(row.amount),
    paymentMethod: row.payment_method,
    status: row.status,
  };
}

export function mapUserOrderDetails(rows: UserOrderDetailsRow[]): UserOrderDetails | null {
  const head = rows[0];

  if (!head) {
    return null;
  }

  const items: UserOrderItem[] = rows.map(row => ({
    orderItemId: row.order_item_id,
    productId: row.product_id,
    productName: row.product_name,
    productImageUrl: row.product_image_url,
    quantity: row.quantity,
    salePrice: toNumber(row.sale_price),
    discount: toNumber(row.item_discount),
    lineAmount: toNumber(row.line_amount),
  }));

  const payment =
    head.payment_date || head.payment_amount || head.payment_status
      ? {
          paymentDate: toNullableDateString(head.payment_date),
          amount: toNullableNumber(head.payment_amount),
          paymentMethod: head.payment_method,
          status: head.payment_status,
        }
      : null;

  const shipment =
    head.shipping_service || head.tracking_number || head.shipping_address || head.shipping_status
      ? {
          shippingService: head.shipping_service,
          trackingNumber: head.tracking_number,
          shippingAddress: head.shipping_address,
          shippingStatus: head.shipping_status,
        }
      : null;

  return {
    orderId: head.order_id,
    orderDate: toDateString(head.order_date),
    status: head.order_status,
    totalAmount: toNumber(head.total_amount),
    selectedPaymentMethod: head.payment_method,
    payment,
    shipment,
    items,
  };
}

export function toAdminOrderDetailsRow(row: Record<string, unknown>): AdminOrderDetailsRow {
  const rawOrderId = row.order_id;

  if (typeof rawOrderId !== 'number') {
    return {
      ...row,
      orderId: 0,
    };
  }

  return {
    ...row,
    orderId: rawOrderId,
  };
}
