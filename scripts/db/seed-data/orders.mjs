// ========== Seed Data ==========
export const orderSeed = [
  {
    key: 'order-1',
    customerKey: 'igor',
    orderDate: '2026-05-02',
    paymentMethod: 'card',
    items: [
      { productName: 'iPhone 15', quantity: 1 },
      { productName: 'Anker 65W USB-C Charger', quantity: 1 },
    ],
  },
  {
    key: 'order-2',
    customerKey: 'olena',
    orderDate: '2026-05-03',
    paymentMethod: 'iban',
    items: [
      { productName: 'MacBook Air M2', quantity: 1 },
      { productName: 'Logitech MX Master 3S', quantity: 1 },
    ],
  },
  {
    key: 'order-3',
    customerKey: 'dmytro',
    orderDate: '2026-05-04',
    paymentMethod: 'cash_on_delivery',
    items: [
      { productName: 'Samsung Galaxy S24', quantity: 1 },
      { productName: 'Apple MagSafe Charger', quantity: 1 },
    ],
  },
  {
    key: 'order-4',
    customerKey: 'maria',
    orderDate: '2026-05-05',
    paymentMethod: 'card',
    items: [{ productName: 'Philips Airfryer HD9252', quantity: 1 }],
  },
  {
    key: 'order-5',
    customerKey: 'andrii',
    orderDate: '2026-05-06',
    paymentMethod: 'iban',
    items: [
      { productName: 'LG UltraFine 27UP650', quantity: 1 },
      { productName: 'TP-Link Archer AX55', quantity: 1 },
    ],
  },
  {
    key: 'order-6',
    customerKey: 'nataliia',
    orderDate: '2026-05-07',
    paymentMethod: 'cash_on_delivery',
    items: [
      { productName: 'AirPods Pro 2', quantity: 1 },
      { productName: 'JBL Charge 5', quantity: 1 },
    ],
  },
];

export const orderStatusSeed = [
  { orderKey: 'order-1', status: 'Completed' },
  { orderKey: 'order-2', status: 'Processing' },
  { orderKey: 'order-3', status: 'Created' },
  { orderKey: 'order-4', status: 'Cancelled' },
  { orderKey: 'order-5', status: 'Pending' },
  { orderKey: 'order-6', status: 'Completed' },
];

export const paymentSeed = [
  { orderKey: 'order-1', paymentDate: '2026-05-02', paymentMethod: 'card' },
  { orderKey: 'order-2', paymentDate: '2026-05-03', paymentMethod: 'iban' },
  { orderKey: 'order-6', paymentDate: '2026-05-07', paymentMethod: 'cash_on_delivery' },
];

export const shipmentSeed = [
  {
    orderKey: 'order-1',
    deliveryService: 'Nova Poshta',
    trackingNumber: 'NP204500001UA',
    shippingAddress: 'м. Київ, відділення №18',
    shipmentStatus: 'delivered',
  },
  {
    orderKey: 'order-2',
    deliveryService: 'Nova Poshta',
    trackingNumber: 'NP204500002UA',
    shippingAddress: 'м. Львів, відділення №33',
    shipmentStatus: 'in_transit',
  },
  {
    orderKey: 'order-3',
    deliveryService: 'Ukrposhta',
    trackingNumber: 'UA0100200300',
    shippingAddress: 'м. Дніпро, вул. Робоча, 92',
    shipmentStatus: 'processing',
  },
  {
    orderKey: 'order-4',
    deliveryService: 'Nova Poshta',
    trackingNumber: 'NP204500004UA',
    shippingAddress: 'м. Одеса, відділення №12',
    shipmentStatus: 'cancelled',
  },
];
