import bcrypt from 'bcrypt';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { fileURLToPath } from 'node:url';

const { Client } = pg;

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const ROOT_DIR = path.resolve(currentDirectoryPath, '..');
const ENV_FILE = path.join(ROOT_DIR, '.env.local');
const MIGRATIONS_DIR = path.join(ROOT_DIR, 'db-migration', 'migrations');
const BASE_SCHEMA_FILE = path.join(ROOT_DIR, 'db-migration', 'schema', 'shopcore_base_schema.sql');

const DEV_USER_EMAIL = 'igormotornyyy@gmail.com';
const DEV_PASSWORD = 'Admin123!';
const ADMIN_EMAIL = 'admin@example.com';

const ALLOWED_LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', 'postgres', 'db', 'host.docker.internal']);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function ensureResetIsAllowed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('db:reset-seed is blocked in production environment');
  }

  if (process.env.SHOPCORE_ALLOW_DB_RESET !== 'true') {
    throw new Error('Set SHOPCORE_ALLOW_DB_RESET=true to run db:reset-seed');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const parsedDatabaseUrl = new URL(process.env.DATABASE_URL);

  if (!ALLOWED_LOCAL_HOSTS.has(parsedDatabaseUrl.hostname) && process.env.SHOPCORE_ALLOW_REMOTE_DB_RESET !== 'true') {
    throw new Error(
      `DATABASE_URL host "${parsedDatabaseUrl.hostname}" is not recognized as local. ` +
        'If this is an intentional dev environment, set SHOPCORE_ALLOW_REMOTE_DB_RESET=true.'
    );
  }
}

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');

  if (!sql.trim()) {
    return;
  }

  await client.query(sql);
}

async function applyMigrations(client) {
  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(fileName => fileName.endsWith('.sql'))
    .sort((first, second) => first.localeCompare(second));

  for (const migrationFile of migrationFiles) {
    const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
    await runSqlFile(client, migrationPath);
    console.info(`[db:reset-seed] applied migration ${migrationFile}`);
  }
}

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function truncateShopCoreTables(client) {
  const tableCandidates = [
    'auth_sessions',
    'auth_users',
    'customers',
    'shipment',
    'payments',
    'order_items',
    'orders',
    'supply_item',
    'deliveries',
    'products',
    'categories',
    'suppliers',
  ];

  const result = await client.query(
    `
      select tablename
      from pg_tables
      where schemaname = 'public'
        and tablename = any($1::text[])
    `,
    [tableCandidates]
  );

  const existingTables = result.rows.map(row => row.tablename);

  if (existingTables.length === 0) {
    console.warn('[db:reset-seed] no known ShopCore tables found to truncate');
    return;
  }

  const truncateSql = `truncate table ${existingTables
    .map(tableName => `public.${quoteIdentifier(tableName)}`)
    .join(', ')} restart identity cascade;`;

  await client.query(truncateSql);
  console.info(`[db:reset-seed] truncated ${existingTables.length} tables`);
}

async function insertCategories(client) {
  const categories = [
    {
      key: 'smartphones',
      name: 'Смартфони',
      description: 'Сучасні смартфони для щоденної роботи, фото та мультимедіа.',
    },
    {
      key: 'notebooks',
      name: 'Ноутбуки',
      description: 'Ноутбуки для навчання, офісної роботи та мобільної продуктивності.',
    },
    {
      key: 'tablets',
      name: 'Планшети',
      description: 'Планшети для роботи з документами, перегляду контенту та творчості.',
    },
    {
      key: 'accessories',
      name: 'Аксесуари',
      description: 'Корисні аксесуари для заряджання, підключення та щоденного комфорту.',
    },
    {
      key: 'audio',
      name: 'Аудіо',
      description: 'Навушники та портативні колонки для якісного звуку.',
    },
    {
      key: 'home',
      name: 'Побутова техніка',
      description: 'Надійна побутова техніка для дому та кухні.',
    },
    {
      key: 'monitors',
      name: 'Монітори',
      description: 'Монітори для роботи, навчання та розваг.',
    },
    {
      key: 'network',
      name: 'Мережеве обладнання',
      description: 'Роутери та Wi-Fi обладнання для стабільного інтернету.',
    },
  ];

  const categoryIds = new Map();

  for (const category of categories) {
    const result = await client.query(
      `
        insert into public.categories (
          category_name,
          description
        )
        values ($1, $2)
        returning category_id
      `,
      [category.name, category.description]
    );

    categoryIds.set(category.key, result.rows[0].category_id);
  }

  return categoryIds;
}

async function insertProducts(client, categoryIds) {
  const products = [
    {
      category: 'smartphones',
      name: 'iPhone 15',
      price: 44999,
      stock: 8,
      discount: 5,
      description: 'Смартфон Apple з OLED-дисплеєм та якісною камерою.',
    },
    {
      category: 'smartphones',
      name: 'Samsung Galaxy S24',
      price: 38999,
      stock: 10,
      discount: 7,
      description: 'Флагманський смартфон Samsung для фото та продуктивності.',
    },
    {
      category: 'smartphones',
      name: 'Google Pixel 8',
      price: 32999,
      stock: 4,
      discount: 0,
      description: 'Смартфон Pixel з чистим Android та якісною обробкою фото.',
    },
    {
      category: 'smartphones',
      name: 'Xiaomi 14',
      price: 29999,
      stock: 0,
      discount: 10,
      description: 'Потужний смартфон із швидкою зарядкою та компактним корпусом.',
    },
    {
      category: 'smartphones',
      name: 'Nothing Phone (2a)',
      price: 19999,
      stock: 3,
      discount: 5,
      description: 'Смартфон із впізнаваним дизайном та плавною роботою.',
    },

    {
      category: 'notebooks',
      name: 'MacBook Air M2',
      price: 52999,
      stock: 6,
      discount: 4,
      description: 'Легкий ноутбук для роботи, навчання та поїздок.',
    },
    {
      category: 'notebooks',
      name: 'Lenovo ThinkPad E14 Gen 5',
      price: 36999,
      stock: 7,
      discount: 8,
      description: 'Надійний бізнес-ноутбук з зручною клавіатурою.',
    },
    {
      category: 'notebooks',
      name: 'ASUS Zenbook 14 OLED',
      price: 41999,
      stock: 5,
      discount: 6,
      description: 'Ноутбук з OLED-екраном для контенту та офісних задач.',
    },
    {
      category: 'notebooks',
      name: 'Acer Swift Go 14',
      price: 30999,
      stock: 2,
      discount: 0,
      description: 'Компактний ультрабук для щоденної мобільної роботи.',
    },
    {
      category: 'notebooks',
      name: 'Dell XPS 13',
      price: 58999,
      stock: 1,
      discount: 9,
      description: 'Преміальний ноутбук із компактним форм-фактором.',
    },

    {
      category: 'tablets',
      name: 'iPad Air 11',
      price: 31999,
      stock: 4,
      discount: 3,
      description: 'Планшет Apple для навчання, ескізів та роботи в дорозі.',
    },
    {
      category: 'tablets',
      name: 'Samsung Galaxy Tab S9 FE',
      price: 22999,
      stock: 6,
      discount: 5,
      description: 'Планшет з підтримкою стилуса для роботи та навчання.',
    },
    {
      category: 'tablets',
      name: 'Lenovo Tab P12',
      price: 18999,
      stock: 0,
      discount: 12,
      description: 'Планшет з великим екраном для мультимедіа.',
    },

    {
      category: 'accessories',
      name: 'Anker 65W USB-C Charger',
      price: 1799,
      stock: 25,
      discount: 0,
      description: 'Компактний зарядний пристрій на 65W для ноутбуків і смартфонів.',
    },
    {
      category: 'accessories',
      name: 'Logitech MX Master 3S',
      price: 4699,
      stock: 9,
      discount: 10,
      description: 'Зручна бездротова миша для офісної та креативної роботи.',
    },
    {
      category: 'accessories',
      name: 'Apple MagSafe Charger',
      price: 2199,
      stock: 11,
      discount: 0,
      description: 'Бездротовий зарядний пристрій для iPhone з MagSafe.',
    },
    {
      category: 'accessories',
      name: 'UGREEN USB-C Hub 6-in-1',
      price: 2499,
      stock: 7,
      discount: 6,
      description: 'USB-C хаб для підключення монітора, флешок та мережі.',
    },

    {
      category: 'audio',
      name: 'AirPods Pro 2',
      price: 10999,
      stock: 8,
      discount: 5,
      description: 'Бездротові навушники з активним шумозаглушенням.',
    },
    {
      category: 'audio',
      name: 'Sony WH-1000XM5',
      price: 14999,
      stock: 5,
      discount: 7,
      description: 'Повнорозмірні навушники преміум-класу для роботи та подорожей.',
    },
    {
      category: 'audio',
      name: 'JBL Charge 5',
      price: 6999,
      stock: 12,
      discount: 0,
      description: 'Портативна колонка з насиченим звучанням та захистом від води.',
    },
    {
      category: 'audio',
      name: 'Marshall Emberton II',
      price: 7999,
      stock: 2,
      discount: 4,
      description: 'Компактна Bluetooth-колонка у фірмовому стилі Marshall.',
    },

    {
      category: 'home',
      name: 'Philips Airfryer HD9252',
      price: 5999,
      stock: 10,
      discount: 8,
      description: 'Аерофритюрниця для щоденного приготування страв.',
    },
    {
      category: 'home',
      name: 'Tefal OptiGrill+',
      price: 9499,
      stock: 4,
      discount: 5,
      description: 'Електрогриль з автоматичними програмами приготування.',
    },
    {
      category: 'home',
      name: 'Xiaomi Mi Smart Kettle Pro',
      price: 2499,
      stock: 0,
      discount: 0,
      description: 'Розумний електрочайник з контролем температури.',
    },

    {
      category: 'monitors',
      name: 'LG UltraFine 27UP650',
      price: 13999,
      stock: 6,
      discount: 6,
      description: '4K-монітор для офісу та обробки контенту.',
    },
    {
      category: 'monitors',
      name: 'Dell S2722QC',
      price: 14999,
      stock: 3,
      discount: 5,
      description: 'Універсальний 27-дюймовий монітор з USB-C.',
    },
    {
      category: 'monitors',
      name: 'Samsung Odyssey G5 27',
      price: 11999,
      stock: 5,
      discount: 9,
      description: 'Ігровий монітор із високою частотою оновлення.',
    },

    {
      category: 'network',
      name: 'TP-Link Archer AX55',
      price: 3699,
      stock: 14,
      discount: 0,
      description: 'Wi-Fi 6 роутер для дому та невеликого офісу.',
    },
    {
      category: 'network',
      name: 'ASUS RT-AX58U',
      price: 4899,
      stock: 6,
      discount: 7,
      description: 'Надійний роутер із підтримкою Wi-Fi 6 і гостьових мереж.',
    },
    {
      category: 'network',
      name: 'Ubiquiti UniFi U6+',
      price: 6299,
      stock: 4,
      discount: 3,
      description: 'Точка доступу для стабільного покриття Wi-Fi у приміщенні.',
    },
    {
      category: 'network',
      name: 'MikroTik hAP ax3',
      price: 5499,
      stock: 2,
      discount: 0,
      description: 'Потужний маршрутизатор із гнучким налаштуванням мережі.',
    },
  ];

  const productIds = new Map();

  for (const product of products) {
    const categoryId = categoryIds.get(product.category);

    const result = await client.query(
      `
        insert into public.products (
          category_id,
          name,
          price,
          stock_quantity,
          discount,
          description
        )
        values ($1, $2, $3, $4, $5, $6)
        returning product_id
      `,
      [categoryId, product.name, product.price, product.stock, product.discount, product.description]
    );

    productIds.set(product.name, result.rows[0].product_id);
  }

  return productIds;
}

async function insertSuppliers(client) {
  const suppliers = [
    { key: 'kyiv-tech', name: 'ТОВ "Київ Тех Дистрибуція"', phone: '+380-67-234-56-78', email: 'sales@kyivtech.ua' },
    {
      key: 'lviv-electronics',
      name: 'ТОВ "Львів Електронікс Груп"',
      phone: '+380-63-345-67-89',
      email: 'office@lvivelectronics.ua',
    },
    {
      key: 'odesa-logistics',
      name: 'ТОВ "Одеський Логістичний Склад"',
      phone: '+380-66-456-78-90',
      email: 'supply@odesalogistics.ua',
    },
    {
      key: 'kharkiv-digital',
      name: 'ТОВ "Харків Діджитал Поставка"',
      phone: '+380-68-567-89-01',
      email: 'partners@kharkivdigital.ua',
    },
    {
      key: 'dnipro-device',
      name: 'ТОВ "Дніпро Device Hub"',
      phone: '+380-73-678-90-12',
      email: 'contact@dniprohub.ua',
    },
  ];

  const supplierIds = new Map();

  for (const supplier of suppliers) {
    const result = await client.query(
      `
        insert into public.suppliers (
          name,
          phone_number,
          email
        )
        values ($1, $2, $3)
        returning supplier_id
      `,
      [supplier.name, supplier.phone, supplier.email]
    );

    supplierIds.set(supplier.key, result.rows[0].supplier_id);
  }

  return supplierIds;
}

async function createDelivery(client, delivery) {
  const result = await client.query(
    `
      select public.pr_register_delivery($1, $2, $3, $4::jsonb) as delivery_id
    `,
    [delivery.supplierId, delivery.deliveryDate, delivery.invoiceNumber, JSON.stringify(delivery.items)]
  );

  return result.rows[0].delivery_id;
}

async function seedDeliveries(client, supplierIds, productIds) {
  const deliveries = [
    {
      supplierId: supplierIds.get('kyiv-tech'),
      deliveryDate: '2026-04-18',
      invoiceNumber: 'UA-INV-2026-0418-01',
      items: [
        { product_id: productIds.get('iPhone 15'), quantity: 6, supply_price: 37900 },
        { product_id: productIds.get('MacBook Air M2'), quantity: 4, supply_price: 42800 },
        { product_id: productIds.get('AirPods Pro 2'), quantity: 7, supply_price: 8400 },
      ],
    },
    {
      supplierId: supplierIds.get('lviv-electronics'),
      deliveryDate: '2026-04-24',
      invoiceNumber: 'UA-INV-2026-0424-02',
      items: [
        { product_id: productIds.get('Lenovo Tab P12'), quantity: 8, supply_price: 14100 },
        { product_id: productIds.get('Xiaomi Mi Smart Kettle Pro'), quantity: 10, supply_price: 1600 },
        { product_id: productIds.get('TP-Link Archer AX55'), quantity: 12, supply_price: 2450 },
      ],
    },
    {
      supplierId: supplierIds.get('odesa-logistics'),
      deliveryDate: '2026-05-03',
      invoiceNumber: 'UA-INV-2026-0503-03',
      items: [
        { product_id: productIds.get('Samsung Galaxy S24'), quantity: 5, supply_price: 31700 },
        { product_id: productIds.get('Dell S2722QC'), quantity: 4, supply_price: 11700 },
        { product_id: productIds.get('UGREEN USB-C Hub 6-in-1'), quantity: 9, supply_price: 1650 },
      ],
    },
  ];

  const deliveryIds = [];

  for (const delivery of deliveries) {
    const deliveryId = await createDelivery(client, delivery);
    deliveryIds.push(deliveryId);
  }

  return deliveryIds;
}

async function createCustomer(client, customer) {
  const result = await client.query(
    `
      insert into public.customers (
        full_name,
        phone_number,
        email,
        address
      )
      values ($1, $2, $3, $4)
      returning customer_id
    `,
    [customer.fullName, customer.phoneNumber, customer.email, customer.address]
  );

  return result.rows[0].customer_id;
}

async function upsertAuthUser(client, user) {
  const passwordHash = await bcrypt.hash(user.password, 12);

  const result = await client.query(
    `
      insert into public.auth_users (
        email,
        password_hash,
        full_name,
        role_name,
        customer_id
      )
      values ($1, $2, $3, $4, $5)
      on conflict (email) do update
      set
        password_hash = excluded.password_hash,
        full_name = excluded.full_name,
        role_name = excluded.role_name,
        customer_id = excluded.customer_id,
        updated_at = now()
      returning user_id
    `,
    [user.email, passwordHash, user.fullName, user.roleName, user.customerId]
  );

  return result.rows[0].user_id;
}

async function seedCustomersAndUsers(client) {
  const customerSeed = [
    {
      key: 'igor',
      fullName: 'Ігор Моторний',
      phoneNumber: '+380-67-123-45-67',
      email: DEV_USER_EMAIL,
      address: 'м. Київ, вул. Січових Стрільців, 25, кв. 14',
    },
    {
      key: 'olena',
      fullName: 'Олена Кравчук',
      phoneNumber: '+380-63-222-11-09',
      email: 'olena.kravchuk@example.ua',
      address: 'м. Львів, вул. Княгині Ольги, 41',
    },
    {
      key: 'dmytro',
      fullName: 'Дмитро Шевченко',
      phoneNumber: '+380-66-333-22-10',
      email: 'dmytro.shevchenko@example.ua',
      address: 'м. Дніпро, просп. Дмитра Яворницького, 58',
    },
    {
      key: 'maria',
      fullName: 'Марія Гончар',
      phoneNumber: '+380-68-444-33-11',
      email: 'maria.honchar@example.ua',
      address: 'м. Одеса, вул. Канатна, 73',
    },
    {
      key: 'andrii',
      fullName: 'Андрій Мельник',
      phoneNumber: '+380-73-555-44-12',
      email: 'andrii.melnyk@example.ua',
      address: 'м. Вінниця, вул. Соборна, 19',
    },
    {
      key: 'nataliia',
      fullName: 'Наталія Петренко',
      phoneNumber: '+380-95-666-55-13',
      email: 'nataliia.petrenko@example.ua',
      address: 'м. Черкаси, бул. Шевченка, 201',
    },
  ];

  const customerIds = new Map();

  for (const customer of customerSeed) {
    const customerId = await createCustomer(client, customer);
    customerIds.set(customer.key, customerId);
  }

  await upsertAuthUser(client, {
    email: DEV_USER_EMAIL,
    password: DEV_PASSWORD,
    fullName: 'Ігор Моторний',
    roleName: 'user',
    customerId: customerIds.get('igor'),
  });

  return customerIds;
}

async function createOrder(client, order) {
  const result = await client.query(
    `
      select public.pr_create_order($1, $2, $3::jsonb) as order_id
    `,
    [order.customerId, order.orderDate, JSON.stringify(order.items)]
  );

  return result.rows[0].order_id;
}

async function seedOrders(client, customerIds, productIds) {
  const orders = [
    {
      key: 'order-1',
      customerId: customerIds.get('igor'),
      orderDate: '2026-05-02',
      items: [
        { product_id: productIds.get('iPhone 15'), quantity: 1 },
        { product_id: productIds.get('Anker 65W USB-C Charger'), quantity: 1 },
      ],
    },
    {
      key: 'order-2',
      customerId: customerIds.get('olena'),
      orderDate: '2026-05-03',
      items: [
        { product_id: productIds.get('MacBook Air M2'), quantity: 1 },
        { product_id: productIds.get('Logitech MX Master 3S'), quantity: 1 },
      ],
    },
    {
      key: 'order-3',
      customerId: customerIds.get('dmytro'),
      orderDate: '2026-05-04',
      items: [
        { product_id: productIds.get('Samsung Galaxy S24'), quantity: 1 },
        { product_id: productIds.get('Apple MagSafe Charger'), quantity: 1 },
      ],
    },
    {
      key: 'order-4',
      customerId: customerIds.get('maria'),
      orderDate: '2026-05-05',
      items: [{ product_id: productIds.get('Philips Airfryer HD9252'), quantity: 1 }],
    },
    {
      key: 'order-5',
      customerId: customerIds.get('andrii'),
      orderDate: '2026-05-06',
      items: [
        { product_id: productIds.get('LG UltraFine 27UP650'), quantity: 1 },
        { product_id: productIds.get('TP-Link Archer AX55'), quantity: 1 },
      ],
    },
    {
      key: 'order-6',
      customerId: customerIds.get('nataliia'),
      orderDate: '2026-05-07',
      items: [
        { product_id: productIds.get('AirPods Pro 2'), quantity: 1 },
        { product_id: productIds.get('JBL Charge 5'), quantity: 1 },
      ],
    },
  ];

  const orderIds = new Map();

  for (const order of orders) {
    const orderId = await createOrder(client, order);
    orderIds.set(order.key, orderId);
  }

  await client.query(`update public.orders set status = 'Completed' where order_id = $1`, [orderIds.get('order-1')]);
  await client.query(`update public.orders set status = 'Processing' where order_id = $1`, [orderIds.get('order-2')]);
  await client.query(`update public.orders set status = 'Created' where order_id = $1`, [orderIds.get('order-3')]);
  await client.query(`update public.orders set status = 'Cancelled' where order_id = $1`, [orderIds.get('order-4')]);
  await client.query(`update public.orders set status = 'Pending' where order_id = $1`, [orderIds.get('order-5')]);
  await client.query(`update public.orders set status = 'Completed' where order_id = $1`, [orderIds.get('order-6')]);

  return orderIds;
}

async function seedPaymentsAndShipments(client, orderIds) {
  await client.query(`call public.pr_register_payment($1, $2, $3)`, [orderIds.get('order-1'), '2026-05-02', 'card']);
  await client.query(`call public.pr_register_payment($1, $2, $3)`, [orderIds.get('order-2'), '2026-05-03', 'iban']);
  await client.query(`call public.pr_register_payment($1, $2, $3)`, [orderIds.get('order-6'), '2026-05-07', 'card']);

  await client.query(`select public.pr_create_shipment($1, $2, $3, $4, $5)`, [
    orderIds.get('order-1'),
    'Nova Poshta',
    'NP204500001UA',
    'м. Київ, відділення №18',
    'delivered',
  ]);

  await client.query(`select public.pr_create_shipment($1, $2, $3, $4, $5)`, [
    orderIds.get('order-2'),
    'Nova Poshta',
    'NP204500002UA',
    'м. Львів, відділення №33',
    'in_transit',
  ]);

  await client.query(`select public.pr_create_shipment($1, $2, $3, $4, $5)`, [
    orderIds.get('order-3'),
    'Ukrposhta',
    'UA0100200300',
    'м. Дніпро, вул. Робоча, 92',
    'processing',
  ]);

  await client.query(`select public.pr_create_shipment($1, $2, $3, $4, $5)`, [
    orderIds.get('order-4'),
    'Nova Poshta',
    'NP204500004UA',
    'м. Одеса, відділення №12',
    'cancelled',
  ]);
}

async function seedShopCoreData(client) {
  await client.query('begin');

  try {
    const categoryIds = await insertCategories(client);
    const productIds = await insertProducts(client, categoryIds);
    const supplierIds = await insertSuppliers(client);
    await seedDeliveries(client, supplierIds, productIds);
    const customerIds = await seedCustomersAndUsers(client);
    const orderIds = await seedOrders(client, customerIds, productIds);
    await seedPaymentsAndShipments(client, orderIds);

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }

  const summaryResult = await client.query(
    `
      select
        (select count(*)::int from public.categories) as categories_count,
        (select count(*)::int from public.products) as products_count,
        (select count(*)::int from public.suppliers) as suppliers_count,
        (select count(*)::int from public.deliveries) as deliveries_count,
        (select count(*)::int from public.customers) as customers_count,
        (select count(*)::int from public.orders) as orders_count
    `
  );

  return summaryResult.rows[0];
}

async function run() {
  loadEnvFile(ENV_FILE);
  ensureResetIsAllowed();

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  await client.connect();

  try {
    const hasBaseSchema = fs.existsSync(BASE_SCHEMA_FILE);

    if (!hasBaseSchema) {
      console.warn(
        '[db:reset-seed] Base schema file is not present. Full schema recreation is unavailable; ' +
          'falling back to data reset (TRUNCATE) and migration reapply.'
      );
    } else {
      console.info('[db:reset-seed] base schema file detected and will be applied');
      await client.query('drop schema if exists public cascade; create schema public;');
      await runSqlFile(client, BASE_SCHEMA_FILE);
    }

    await truncateShopCoreTables(client);
    await applyMigrations(client);

    const summary = await seedShopCoreData(client);

    console.info('[db:reset-seed] done');
    console.info(
      `[db:reset-seed] summary: categories=${summary.categories_count}, products=${summary.products_count}, ` +
        `suppliers=${summary.suppliers_count}, deliveries=${summary.deliveries_count}, ` +
        `customers=${summary.customers_count}, orders=${summary.orders_count}`
    );
    console.info(
      `[db:reset-seed] accounts: ${ADMIN_EMAIL} / ${DEV_PASSWORD} (admin is created by runtime bootstrap), ` +
        `${DEV_USER_EMAIL} / ${DEV_PASSWORD}`
    );
  } finally {
    await client.end();
  }
}

run().catch(error => {
  console.error('[db:reset-seed] failed', error);
  process.exitCode = 1;
});
