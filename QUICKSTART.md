# Quick Start Cheat Sheet

## 🚀 Get Running in 5 Minutes

```bash
# 1. Clone & setup
git clone <repo>
cd SME_ecommerce
cp .env.example .env

# 2. Start everything
docker-compose up -d

# 3. Visit in browser
# Admin Panel:  http://localhost:3100
# Store:        http://localhost:3101
# API:          http://localhost:3000/api/v1
# Grafana:      http://localhost:3050 (admin/admin)
```

## 📊 Service Ports

| Service | Port | Health Check |
|---------|------|--------------|
| API Gateway | 3000 | `curl http://localhost:3000/health` |
| User Service | 3001 | `curl http://localhost:3001/health` |
| Product Service | 3002 | `curl http://localhost:3002/health` |
| Order Service | 3003 | `curl http://localhost:3003/health` |
| Payment Service | 3004 | `curl http://localhost:3004/health` |
| Shipping Service | 3005 | `curl http://localhost:3005/health` |
| Subscription Service | 3006 | `curl http://localhost:3006/health` |
| Job Board Service | 3007 | `curl http://localhost:3007/health` |
| Admin Panel | 3100 | `http://localhost:3100` |
| Customer Storefront | 3101 | `http://localhost:3101` |
| PostgreSQL | 5432 | psql command |
| Redis | 6379 | redis-cli |
| Prometheus | 9090 | `http://localhost:9090` |
| Grafana | 3050 | `http://localhost:3050` |

## 🛠️ Common Commands

```bash
# View all containers
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f api-gateway

# Enter service shell
docker-compose exec api-gateway sh

# Stop services
docker-compose stop

# Start services
docker-compose start

# Restart specific service
docker-compose restart api-gateway

# Rebuild and restart
docker-compose up --build -d api-gateway

# Clean up (delete all containers & volumes)
docker-compose down -v

# Execute database command
docker-compose exec postgres psql -U sme_user -d sme_ecommerce
```

## 🔨 Development Workflow

```bash
# 1. Start docker-compose once
docker-compose up -d

# 2. In separate terminal, develop specific service
cd services/api-gateway
npm install  # First time only
npm run dev  # Watch mode

# Files auto-reload via nodemon

# 3. Test your changes
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/products
```

## 📝 API Examples

```bash
# Signup
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "secure123",
    "full_name": "John Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "secure123"
  }'

# Get products
curl http://localhost:3000/api/v1/products?limit=10

# Get product by ID
curl http://localhost:3000/api/v1/products/{id}

# Create order
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "billing_address_line1": "123 Main St",
    "billing_city": "Cape Town",
    "billing_postal_code": "8000",
    "items": [{"product_id": "prod-uuid", "quantity": 1}]
  }'
```

## 🗄️ Database Queries

```bash
# Connect to database
docker-compose exec postgres psql -U sme_user -d sme_ecommerce

# List all tables
\dt

# Describe table
\d products

# Sample queries
SELECT * FROM products LIMIT 10;
SELECT * FROM orders WHERE order_status = 'pending';
SELECT COUNT(*) FROM users;
SELECT * FROM sme_stores WHERE is_active = true;
```

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: describe your feature"

# Push to your fork
git push origin feature/your-feature

# Create Pull Request on GitHub
# Wait for CI/CD checks to pass
# Request review from maintainers
```

## 🚀 Deployment

### Local (Free)
```bash
docker-compose up
```

### Azure Free Tier
```bash
# See docs/DEPLOYMENT.md
az login
az group create --name sme-ecommerce-rg --location eastus
# ... (follow full guide)
```

## 📊 Monitoring

### Grafana
- URL: http://localhost:3050
- Username: admin
- Password: admin

### Prometheus
- URL: http://localhost:9090
- Metrics: http://localhost:9090/metrics

## 🆘 Troubleshooting

**Services won't start?**
```bash
docker-compose down -v
docker-compose up --build -d
docker-compose logs -f
```

**Port already in use?**
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Database connection fails?**
```bash
docker-compose ps postgres
docker-compose logs postgres
docker-compose exec postgres psql -U sme_user
```

**Clear cache?**
```bash
docker-compose exec redis redis-cli FLUSHALL
```

## 📚 File Structure

```
SME_ecommerce/
├── services/           # Microservices
├── frontend/           # React apps
├── database/           # Database schema
├── infrastructure/     # Docker, monitoring
├── docs/               # Documentation
├── docker-compose.yml  # Local setup
└── README.md           # Main docs
```

## 🔐 Important Files

- **Configuration**: `.env` or `.env.example`
- **Database**: `database/init.sql`
- **Docker**: `docker-compose.yml`
- **Docs**: `README.md`, `docs/DEVELOPMENT.md`
- **CI/CD**: `.github/workflows/ci-cd.yml`

## 💡 Pro Tips

1. **Use `docker-compose logs -f service-name`** for debugging
2. **Set `NODE_ENV=development`** to skip minification
3. **Keep `.env` secrets secure** - never commit it
4. **Test API with curl or Postman** before frontend
5. **Use `LIMIT 10`** in SQL to avoid large result sets
6. **Check health endpoints** first to diagnose issues
7. **Use `nodemon`** for auto-reload during development

## 🎯 Next Steps

1. ✅ Read this cheat sheet
2. 📖 Read [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed guide
3. 🔌 Read [API_DOCS.md](docs/API_DOCS.md) for endpoint details
4. 🚀 Read [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production
5. 👥 Read [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## ❓ Questions?

- Check documentation in `docs/` folder
- Open an issue on GitHub
- Review existing issues and discussions
- Ask in community Slack/Discord

---

**Ready to build?** 🎉 Start with `docker-compose up` and visit http://localhost:3100!
