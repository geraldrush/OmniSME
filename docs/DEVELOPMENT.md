# SME E-commerce Enabler - Development Guide

## Prerequisites

- **Node.js**: 18+ (Download from [nodejs.org](https://nodejs.org))
- **Docker**: 20.10+ (Download from [docker.com](https://www.docker.com))
- **Docker Compose**: 2.0+ (Usually included with Docker Desktop)
- **Git**: 2.25+ (Download from [git-scm.com](https://www.git-scm.com))

## Quick Start (5 minutes)

### 1. Clone Repository

```bash
git clone <repository-url>
cd SME_ecommerce
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set your local configuration (most defaults are fine for development).

### 3. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- API Gateway on port 3000
- All microservices (ports 3001-3007)
- Admin Panel on port 3100
- Customer Storefront on port 3101
- Prometheus on port 9090
- Grafana on port 3050

### 4. Verify Services

```bash
# Check if all containers are running
docker-compose ps

# Check API Gateway health
curl http://localhost:3000/health

# Check Admin Panel
open http://localhost:3100 (or just visit in your browser)

# Check Customer Storefront
open http://localhost:3101
```

## Development Workflow

### Working with a Specific Service

```bash
# Terminal 1: Start all services
docker-compose up -d

# Terminal 2: Navigate to service and develop
cd services/api-gateway
npm install                    # First time only
npm run dev                    # Watch mode with auto-reload

# Most services are configured to auto-reload on file changes via nodemon
```

### Database Management

```bash
# Access PostgreSQL directly
psql -h localhost -U sme_user -d sme_ecommerce -W
# Password: sme_password_dev

# Or use docker exec
docker exec -it sme_postgres psql -U sme_user -d sme_ecommerce

# View migrations and schema
\dt                           # List tables
\d table_name                 # Describe table structure
```

### Redis Management

```bash
# Connect to Redis
redis-cli -h localhost -p 6379

# Common commands
PING                          # Test connection
INFO                          # Server info
FLUSHALL                      # Clear all data (development only!)
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway

# With timestamps
docker-compose logs -f --timestamps api-gateway
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
```http
POST /auth/signup
{
  "email": "owner@example.com",
  "password": "secure123",
  "full_name": "John Doe",
  "user_type": "sme_owner"
}

POST /auth/login
{
  "email": "owner@example.com",
  "password": "secure123"
}
```

### Products
```http
GET /products?limit=20&offset=0
GET /products/{id}
POST /products (requires auth + sme_owner role)
PUT /products/{id}
DELETE /products/{id}
```

### Orders
```http
GET /orders
GET /orders/{id}
POST /orders
PUT /orders/{id}
```

### Payments
```http
POST /payments
GET /payments/{id}
POST /payments/payfast/notify (webhook)
POST /payments/ozow/webhook (webhook)
```

### Shipping
```http
POST /shipping/quote
POST /shipping/book
GET /shipping/track/{reference}
```

### Subscriptions
```http
GET /subscriptions/plans
POST /subscriptions
GET /subscriptions/{id}
```

## Testing

### Run Tests for a Service

```bash
cd services/api-gateway
npm test

# With coverage
npm test -- --coverage
```

### Using Postman/Insomnia

A Postman collection is available at: `docs/postman-collection.json`

Import it into Postman/Insomnia:
1. Open Postman
2. File → Import
3. Select `docs/postman-collection.json`
4. All endpoints are ready to use

## Monitoring

### Grafana Dashboard
- **URL**: http://localhost:3050
- **Username**: admin
- **Password**: admin

### Prometheus
- **URL**: http://localhost:9090

## Troubleshooting

### Services won't start

```bash
# Clean up containers and volumes
docker-compose down -v

# Rebuild images
docker-compose up --build -d

# Check logs for errors
docker-compose logs -f
```

### Port already in use

```bash
# Find what's using the port
lsof -i :3000  # On macOS/Linux
netstat -ano | findstr :3000  # On Windows

# Kill the process
kill -9 <PID>  # On macOS/Linux
taskkill /PID <PID> /F  # On Windows
```

### Database connection errors

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Recreate database
docker-compose exec postgres psql -U sme_user -d sme_ecommerce < database/init.sql
```

### Redis connection errors

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping
```

## Code Structure

```
SME_ecommerce/
├── services/
│   ├── api-gateway/          # Main entry point
│   ├── user-service/         # Authentication & users
│   ├── product-service/      # Products & categories
│   ├── order-service/        # Orders & cart
│   ├── payment-service/      # PayFast, Ozow integration
│   ├── shipping-service/     # Courier APIs
│   ├── subscription-service/ # Billing & plans
│   └── job-board-service/    # Lead generation
├── frontend/
│   ├── admin-panel/          # React admin interface
│   └── customer-storefront/  # React customer store
├── database/
│   ├── init.sql              # Schema definition
│   └── migrations/           # Migration scripts
├── infrastructure/
│   ├── prometheus.yml        # Metrics config
│   └── docker-compose.yml    # Local setup
├── shared/                   # Shared libraries
└── docs/                     # Documentation
```

## Useful Commands

```bash
# View all running containers
docker ps

# View all images
docker images

# Remove unused images
docker image prune

# Remove all stopped containers
docker container prune

# Tail logs from multiple services
docker-compose logs -f api-gateway user-service product-service

# Enter service shell
docker-compose exec api-gateway sh

# Rebuild specific service
docker-compose up --build api-gateway

# Stop all services
docker-compose stop

# Start all services
docker-compose start

# Remove everything (containers, volumes)
docker-compose down -v
```

## Environment Variables

Key variables for development (see `.env.example` for all):

```
NODE_ENV=development
DATABASE_URL=postgresql://sme_user:sme_password_dev@postgres:5432/sme_ecommerce
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-key-change-in-production
PAYFAST_MERCHANT_ID=test-merchant (get from PayFast)
OZOW_API_KEY=test-key (get from Ozow)
```

## Performance Tips

1. **Use Redis caching** for frequently accessed data
2. **Index database columns** for common queries
3. **Paginate API responses** (default: limit=20)
4. **Use Connection pooling** in database clients
5. **Monitor with Prometheus/Grafana** for bottlenecks

## Next Steps

1. ✅ Set up development environment
2. 📚 Read [API_DOCS.md](API_DOCS.md) for endpoint details
3. 🚀 Read [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
4. 🔒 Check [SECURITY.md](SECURITY.md) for security best practices
5. 👥 Follow [CONTRIBUTION.md](CONTRIBUTION.md) to contribute

## Getting Help

- **Issues**: Check GitHub Issues or create a new one
- **Documentation**: Check the `docs/` folder
- **Community**: [Join our Slack/Discord]

## Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [React Documentation](https://react.dev/)

---

Happy coding! 🚀
