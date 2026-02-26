# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer {jwt_token}
```

## Response Format

All responses follow this format:

```json
{
  "status": "success|error",
  "data": {},
  "message": "Human readable message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Endpoints

### Authentication Service

#### Sign Up (Create SME Account)
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "secure_password",
  "full_name": "John Doe"
}

Response (201):
{
  "token": "eyJhbGc...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "owner@example.com",
    "full_name": "John Doe",
    "user_type": "sme_owner"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "secure_password"
}

Response (200):
{
  "token": "eyJhbGc...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "owner@example.com"
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer {jwt_token}

Response (200):
{
  "token": "eyJhbGc..."
}
```

### Users Service

#### Get User Profile
```http
GET /users/:id
Authorization: Bearer {jwt_token}

Response (200):
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "owner@example.com",
    "full_name": "John Doe",
    "phone": "+27123456789",
    "avatar_url": "https://..."
  }
}
```

#### Update User Profile
```http
PUT /users/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "full_name": "John Smith",
  "phone": "+27987654321"
}

Response (200):
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "owner@example.com",
    "full_name": "John Smith",
    "phone": "+27987654321"
  }
}
```

### Store Management

#### Create Store
```http
POST /stores
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "store_name": "My Amazing Store",
  "store_slug": "my-amazing-store",
  "description": "Best store in South Africa",
  "email": "store@example.com",
  "phone": "+27123456789"
}

Response (201):
{
  "store": {
    "id": "store-uuid",
    "store_name": "My Amazing Store",
    "store_slug": "my-amazing-store",
    "is_active": true
  }
}
```

#### Get Store
```http
GET /stores/:slug

Response (200):
{
  "store": {
    "id": "store-uuid",
    "store_name": "My Amazing Store",
    "store_slug": "my-amazing-store",
    "description": "Best store in South Africa",
    "is_active": true,
    "subscription_status": "active"
  }
}
```

### Products Service

#### List Products
```http
GET /products?category_id=cat-uuid&search=query&limit=20&offset=0

Response (200):
{
  "products": [
    {
      "id": "prod-uuid",
      "product_name": "Product Name",
      "price": 299.99,
      "currency": "ZAR",
      "quantity_in_stock": 50,
      "is_featured": false
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

#### Get Product Details
```http
GET /products/:id

Response (200):
{
  "product": {
    "id": "prod-uuid",
    "product_name": "Product Name",
    "description": "Long description",
    "price": 299.99,
    "cost_price": 150.00,
    "currency": "ZAR",
    "quantity_in_stock": 50,
    "image_url": "https://...",
    "weight_kg": 2.5,
    "is_featured": true
  }
}
```

#### Create Product (SME Only)
```http
POST /products
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "category_id": "cat-uuid",
  "product_name": "New Product",
  "price": 299.99,
  "cost_price": 150.00,
  "quantity_in_stock": 50,
  "description": "Product description",
  "weight_kg": 2.5,
  "image_url": "https://..."
}

Response (201):
{
  "product": {
    "id": "prod-uuid",
    "product_name": "New Product",
    "price": 299.99
  }
}
```

#### Update Product (SME Only)
```http
PUT /products/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "price": 349.99,
  "quantity_in_stock": 60
}

Response (200):
{
  "product": {
    "id": "prod-uuid",
    "price": 349.99,
    "quantity_in_stock": 60
  }
}
```

#### Delete Product (SME Only)
```http
DELETE /products/:id
Authorization: Bearer {jwt_token}

Response (204): No Content
```

### Orders Service

#### List Orders
```http
GET /orders?status=pending&limit=20&offset=0
Authorization: Bearer {jwt_token}

Response (200):
{
  "orders": [
    {
      "id": "order-uuid",
      "order_number": "ORD-20240101-001",
      "total_amount": 599.99,
      "order_status": "pending",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 1
}
```

#### Get Order Details
```http
GET /orders/:id

Response (200):
{
  "order": {
    "id": "order-uuid",
    "order_number": "ORD-20240101-001",
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "subtotal": 500.00,
    "tax_amount": 50.00,
    "shipping_cost": 49.99,
    "total_amount": 599.99,
    "order_status": "processing",
    "payment_status": "completed",
    "items": [
      {
        "product_id": "prod-uuid",
        "product_name": "Product",
        "quantity": 2,
        "unit_price": 250.00
      }
    ]
  }
}
```

#### Create Order (Customer)
```http
POST /orders
Content-Type: application/json

{
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "+27123456789",
  "billing_address_line1": "123 Main St",
  "billing_city": "Cape Town",
  "billing_postal_code": "8000",
  "shipping_address_line1": "123 Main St",
  "shipping_city": "Cape Town",
  "shipping_postal_code": "8000",
  "items": [
    {
      "product_id": "prod-uuid",
      "quantity": 2
    }
  ],
  "shipping_method": "standard"
}

Response (201):
{
  "order": {
    "id": "order-uuid",
    "order_number": "ORD-20240101-001",
    "total_amount": 599.99
  }
}
```

#### Update Order Status (SME Only)
```http
PUT /orders/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "order_status": "shipped",
  "tracking_number": "TRK123456"
}

Response (200):
{
  "order": {
    "id": "order-uuid",
    "order_status": "shipped",
    "tracking_number": "TRK123456"
  }
}
```

### Shopping Cart

#### Get Cart
```http
GET /carts/:cart_id

Response (200):
{
  "cart": {
    "id": "cart-uuid",
    "items": [
      {
        "product_id": "prod-uuid",
        "product_name": "Product",
        "quantity": 2,
        "unit_price": 250.00,
        "total_price": 500.00
      }
    ],
    "total": 500.00
  }
}
```

#### Create Cart
```http
POST /carts

Response (201):
{
  "cart": {
    "id": "cart-uuid",
    "items": [],
    "total": 0
  }
}
```

#### Add Item to Cart
```http
POST /carts/:cart_id/items
Content-Type: application/json

{
  "product_id": "prod-uuid",
  "quantity": 2
}

Response (201):
{
  "item": {
    "product_id": "prod-uuid",
    "quantity": 2
  }
}
```

#### Remove Item from Cart
```http
DELETE /carts/:cart_id/items/:item_id

Response (204): No Content
```

### Payments Service

#### Initiate Payment
```http
POST /payments
Content-Type: application/json

{
  "order_id": "order-uuid",
  "payment_gateway": "payfast",
  "amount": 599.99,
  "currency": "ZAR"
}

Response (201):
{
  "payment": {
    "id": "payment-uuid",
    "order_id": "order-uuid",
    "payment_status": "pending",
    "redirect_url": "https://payfast.co.za/..."
  }
}
```

#### Get Payment Status
```http
GET /payments/:payment_id

Response (200):
{
  "payment": {
    "id": "payment-uuid",
    "order_id": "order-uuid",
    "amount": 599.99,
    "payment_status": "completed",
    "gateway_transaction_id": "T123456789"
  }
}
```

#### PayFast ITN Webhook
```http
POST /payments/payfast/notify
Content-Type: application/x-www-form-urlencoded

m_payment_id={order_id}&pf_payment_id={payment_id}&payment_status=COMPLETE&...

Response (200):
{ "status": "ok" }
```

#### Ozow Webhook
```http
POST /payments/ozow/webhook
Content-Type: application/json

{
  "transactionReference": "string",
  "transactionStatus": "COMPLETE",
  "checkoutId": "string"
}

Response (200):
{ "status": "ok" }
```

### Shipping Service

#### Get Shipping Quotes
```http
POST /shipping/quote
Content-Type: application/json

{
  "from_postal_code": "8000",
  "to_postal_code": "2000",
  "weight_kg": 2.5,
  "dimensions": {
    "length": 20,
    "width": 15,
    "height": 10
  }
}

Response (200):
{
  "quotes": [
    {
      "carrier": "courier_guy",
      "service_name": "Standard Delivery",
      "cost": 50.00,
      "estimated_days": 2
    },
    {
      "carrier": "bob_go",
      "service_name": "Express",
      "cost": 75.00,
      "estimated_days": 1
    }
  ]
}
```

#### Book Shipping
```http
POST /shipping/book
Content-Type: application/json

{
  "order_id": "order-uuid",
  "carrier": "courier_guy",
  "quote_reference": "QUOTE-123"
}

Response (201):
{
  "label": {
    "id": "label-uuid",
    "tracking_number": "CG123456789",
    "carrier": "courier_guy",
    "label_url": "https://..."
  }
}
```

#### Track Shipment
```http
GET /shipping/track/:tracking_number

Response (200):
{
  "tracking": {
    "tracking_number": "CG123456789",
    "status": "in_transit",
    "carrier": "courier_guy",
    "last_update": "2024-01-01T12:00:00Z",
    "location": "Johannesburg Distribution Center"
  }
}
```

### Subscriptions

#### Get Subscription Plans
```http
GET /subscriptions/plans

Response (200):
{
  "plans": [
    {
      "id": "plan-uuid",
      "plan_name": "Starter",
      "monthly_price": 99.00,
      "annual_price": 990.00,
      "max_products": 100,
      "max_users": 1
    },
    {
      "id": "plan-uuid",
      "plan_name": "Professional",
      "monthly_price": 199.00,
      "annual_price": 1990.00,
      "max_products": 1000,
      "max_users": 5
    }
  ]
}
```

#### Create Subscription
```http
POST /subscriptions
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "plan_id": "plan-uuid",
  "billing_cycle": "monthly"
}

Response (201):
{
  "subscription": {
    "id": "sub-uuid",
    "plan_id": "plan-uuid",
    "status": "active",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "You don't have permission to access this resource",
  "code": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Rate Limiting

All endpoints are rate limited:
- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

## Pagination

List endpoints support:
- **limit**: Number of results (default: 20, max: 100)
- **offset**: Number of results to skip (default: 0)

## Sorting

Supported on most list endpoints:
```
GET /products?sort=-created_at,name
```

- `-` prefix: descending order
- Default: ascending order

---

For more details or to test endpoints, see [DEVELOPMENT.md](DEVELOPMENT.md#testing)
