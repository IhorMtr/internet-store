# ShopCore

## Короткий опис

ShopCore — веб-застосунок інтернет-магазину з розділеними admin та user потоками. Проєкт включає API на базі PostgreSQL,
role-based доступ і storefront для покупців.

## Функціонал

### Auth

- Реєстрація та вхід користувача.
- Refresh і logout сесії.
- Role-based доступ для admin і user.

### Admin

- Dashboard зі зведеними показниками.
- CRUD для категорій, товарів і постачальників.
- Реєстрація поставок.
- Перегляд і керування замовленнями.
- Оновлення shipment і payment статусів.
- Аналітика: продажі товарів і топ категорій.

### Storefront

- Каталог товарів (пошук, фільтр за категорією).
- Перегляд деталей товару.
- Кошик у localStorage.
- Checkout і створення замовлення.
- Перегляд власних замовлень.
- Імітація оплати.

## Стек технологій

- Next.js
- TypeScript
- PostgreSQL
- Tailwind CSS
- next-intl
- React Query
- Zustand
- Formik/Yup
- Radix UI primitives
- lucide-react

## Архітектура

```txt
src/app                      - маршрути сторінок і route handlers
src/domains                  - клієнтські домени (auth/admin/store)
src/page-components          - page-level UI компоненти
src/server                   - серверні сервіси та репозиторії
src/shared                   - спільні UI, API-утиліти, i18n, провайдери
scripts                      - локальні службові скрипти (reset/seed)
```

## База даних

Основні сутності:

- auth_users
- user_roles
- user_sessions
- customers
- categories
- products
- suppliers
- deliveries
- supply_item
- orders
- order_items
- payments
- shipment

Ключові business rules:

- Товар належить до категорії.
- stock_quantity не може бути від'ємним.
- Продаж зменшує stock.
- Поставка збільшує stock.
- Сума замовлення обчислюється з order_items.
- Повторна оплата одного замовлення заборонена.
- Замовлення не створюється без customer та items.
- Дати в операціях обмежені current_date.

## API

Основні групи:

- /api/auth/\*\*
- /api/admin/\*\*
- /api/store/\*\*

Ключові endpoints:

- Auth: POST /api/auth/login, POST /api/auth/register, POST /api/auth/refresh, POST /api/auth/logout, GET
  /api/auth/session
- Admin: /api/admin/categories, /api/admin/products, /api/admin/suppliers, /api/admin/deliveries, /api/admin/orders,
  /api/admin/reports/\*
- Store: GET /api/store/categories, GET /api/store/products, GET /api/store/products/[productId], POST
  /api/store/orders, GET /api/store/orders, GET /api/store/orders/[orderId], POST /api/store/orders/[orderId]/payment

## Локальний запуск

Встановлення залежностей:

```bash
npm install
```

Запуск dev-сервера:

```bash
npm run dev
```

## Змінні середовища

Приклад .env.local:

```env
DATABASE_URL=postgresql://...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
SHOPCORE_ADMIN_EMAIL=admin@example.com
SHOPCORE_ADMIN_PASSWORD=change-me
SHOPCORE_ADMIN_FULL_NAME=ShopCore Admin

# Опційно: зображення товарів (Cloudinary)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=shopcore/products
```

## Cloudinary

- Зображення товарів завантажуються вручну адміністратором через Admin -> Products.
- Підтримується одне зображення на товар (завантаження, заміна, видалення).
- Якщо зображення відсутнє, UI показує fallback.
- Якщо Cloudinary-змінні не задані, завантаження вимикається, але наявні URL зображень продовжують відображатися.
- Автоматичне підвантаження зображень із зовнішніх джерел не використовується.

## Seed/reset

- Точка входу для локального reset/seed: scripts/db-reset-seed.mjs.
- Схема БД відтворюється з актуальної baseline-схеми: db-migration/schema/shopcore_base_schema.sql.
- db:reset-seed створює тільки admin auth-акаунт із SHOPCORE_ADMIN_EMAIL, SHOPCORE_ADMIN_PASSWORD,
  SHOPCORE_ADMIN_FULL_NAME.
- Звичайний user auth bootstrap навмисно не створюється; user реєструється через UI.

Команда:

```bash
SHOPCORE_ALLOW_DB_RESET=true npm run db:reset-seed
```

Примітки безпеки:

- Скрипт destructive: очищає дані ShopCore-таблиць або перевідтворює public schema (за наявності base schema).
- У production скрипт заблокований.
- Для non-local host потрібне явне підтвердження SHOPCORE_ALLOW_REMOTE_DB_RESET=true.
- Використовувати лише для dev/local середовища.

## Тестові акаунти

`npm run db:reset-seed` створює admin-акаунт лише з env-змінних.

- Обов'язково:
  - SHOPCORE_ADMIN_EMAIL
  - SHOPCORE_ADMIN_PASSWORD
  - SHOPCORE_ADMIN_FULL_NAME
- Дефолтний звичайний user-акаунт автоматично не створюється.

## Перевірки

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Примітка:

- Проєкт використовує next/font/google (Geist).
- У середовищах з обмеженим зовнішнім доступом build може падати через мережеві обмеження на етапі завантаження шрифтів.

## Обмеження

- Немає інтеграції з реальним платіжним провайдером.
- Кошик не зберігається в БД (тільки frontend state/localStorage).
- Оплата реалізована як імітація через запис у БД.
- Немає reviews/favorites/coupons.
- Підтримується одне зображення на товар.
